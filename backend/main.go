package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Todo struct {
	ID          int    `db:"id" json:"id"`
	Number      string `db:"number" json:"number"`
	Category    string `db:"category" json:"category"`
	Content     string `db:"content" json:"content"`
	Env         string `db:"env" json:"env"`
	Expected    string `db:"expected" json:"expected"`
	IsCompleted bool   `db:"is_completed" json:"is_completed"`
	// Time型を使用し、Nullを許容するためにポインタにする
	CompletedAt *time.Time `db:"completed_at" json:"completed_at"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
	Version     int        `db:"version" json:"version"`
}

func main() {
	// ターミナルの環境変数から読み込む設定
	dsn := os.Getenv("DATABASE_URL")
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalln("🚨 Supabase接続失敗:", err)
	}

	// schema 変数と db.MustExec(schema) は削除
	// 代わりに接続確認のみ行う
	err = db.Ping()
	if err != nil {
		log.Fatal("🚨 DB応答なし:", err)
	}
	fmt.Println("✅ DB接続完了。マイグレーションは schema.sql を参照してください。")

	// --- ここからサーバーの設定 ---
	r := gin.Default() //ginルーター作成

	// CORS設定を詳細に指定
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://sop-frontend-one.vercel.app",
		},
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 手順一覧を取得するAPI(スキャニング)
	r.GET("/todos", func(c *gin.Context) {
		var todos []Todo
		// カラムを明示的に指定（SQLに合わせて completed_at, updated_at を追加）
		query := `SELECT id, number, category, content, env, expected, is_completed, completed_at, created_at, updated_at ,version
              FROM todos ORDER BY id ASC`
		err := db.Select(&todos, query)
		if err != nil {
			// 原因を突き止めるためのログ出力
			fmt.Printf("🚨 DB Error: %v\n", err)

			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, todos)
	})

	// 手順を新規登録するAPI
	r.POST("/todos", func(c *gin.Context) {
		var newTodo Todo
		// 1. フロントエンドから送られてきたJSONをTodo構造体に読み込む
		if err := c.ShouldBindJSON(&newTodo); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 2. DBに挿入し、自動採番されたIDを返す
		query := `INSERT INTO todos (number, category, content, env, expected) 
                  VALUES ($1, $2, $3, $4, $5) 
                  RETURNING id, is_completed, created_at, version`

		err := db.QueryRow(query,
			newTodo.Number,
			newTodo.Category,
			newTodo.Content,
			newTodo.Env,
			newTodo.Expected,
		).Scan(&newTodo.ID, &newTodo.IsCompleted, &newTodo.CreatedAt, &newTodo.Version)

		if err != nil {
			fmt.Printf("🚨 Insert Error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 3. 成功したら、IDが付与された完成版のデータをフロントに返す
		c.JSON(http.StatusCreated, newTodo)
	})

	// 手順を削除するAPI
	r.DELETE("/todos/:id", func(c *gin.Context) {
		idParam := c.Param("id")

		var id int
		if _, err := fmt.Sscanf(idParam, "%d", &id); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}

		result, err := db.Exec("DELETE FROM todos WHERE id = $1", id)
		if err != nil {
			fmt.Printf("🚨 Delete Error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
			return
		}

		rows, _ := result.RowsAffected()
		if rows == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}

		c.Status(http.StatusNoContent)
	}) // 204 No Content を返す

	// 完了状態のトグル（DB側で反転させる）
	r.PATCH("/todos/:id/toggle", func(c *gin.Context) {
		id := c.Param("id")
		query := `
		UPDATE todos
		SET
   			completed_at =
        		CASE
            		WHEN is_completed = false THEN CURRENT_TIMESTAMP
            		ELSE NULL
        		END,
    		is_completed = NOT is_completed,
    		version = version + 1,
    		updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
		RETURNING *`
		var updated Todo
		if err := db.Get(&updated, query, id); err != nil {
			fmt.Println("🚨 Toggle error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, updated)
	})

	// テキスト変更等の PATCH (楽観的ロック)
	r.PATCH("/todos/:id", func(c *gin.Context) {
		id := c.Param("id")
		// 全フィールドをポインタにして、送られてきたキーだけを判別
		var input struct {
			Number      *string `json:"number"`
			Category    *string `json:"category"`
			Content     *string `json:"content"`
			Env         *string `json:"env"`
			Expected    *string `json:"expected"`
			IsCompleted *bool   `json:"is_completed"`
			Version     int     `json:"version" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Version is required"})
			return
		}

		query := `
			UPDATE todos SET 
				number = COALESCE($1, number), category = COALESCE($2, category),
				content = COALESCE($3, content), env = COALESCE($4, env),
				expected = COALESCE($5, expected), version = version + 1, updated_at = CURRENT_TIMESTAMP
			WHERE id = $6 AND version = $7
			RETURNING *`
		var updated Todo
		err := db.Get(&updated, query, input.Number, input.Category, input.Content, input.Env, input.Expected, id, input.Version)
		if err != nil {
			// 更新件数0件（version不一致）の場合
			fmt.Printf("🚨 Update Error: %v\n", err)
			c.JSON(http.StatusConflict, gin.H{"error": "競合が発生しました。"})
			return
		}

		c.JSON(http.StatusOK, updated)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // ローカル用のデフォルト
	}
	r.Run(":" + port)
}
