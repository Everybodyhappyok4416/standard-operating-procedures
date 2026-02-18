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
	ID          int       `db:"id" json:"id"`
	Number      string    `db:"number" json:"number"`
	Category    string    `db:"category" json:"category"`
	Content     string    `db:"content" json:"content"`
	Env         string    `db:"env" json:"env"`
	Expected    string    `db:"expected" json:"expected"`
	IsCompleted bool      `db:"is_completed" json:"is_completed"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}

func main() {
	// ターミナルの環境変数から読み込む設定（推奨）
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = ""
	}

	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalln("🚨 Supabaseへの接続に失敗しました:", err)
	}

	fmt.Println("✅ Supabaseへの接続に成功しました！")

	schema := `
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        number TEXT,
        category TEXT,
        content TEXT,
        env TEXT,
        expected TEXT,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
	db.MustExec(schema)

	// --- ここからサーバーの設定 ---
	r := gin.Default()

	// CORS設定を詳細に指定
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"https://sop-frontend-one.vercel.app", // ← ここを自分のVercelのURLに変える！
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 手順一覧を取得するAPI
	r.GET("/todos", func(c *gin.Context) {
		var todos []Todo
		// SQLを「*」ではなく、構造体にある項目だけ明示的に指定します
		// SELECT文に created_at が含まれているか確認！
		err := db.Select(&todos, "SELECT id, number, category, content, env, expected, is_completed, created_at FROM todos ORDER BY id ASC")
		if err != nil {
			// 【重要】ここが原因を突き止めるためのログ出力です
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
                  RETURNING id, is_completed, created_at`

		err := db.QueryRow(query,
			newTodo.Number,
			newTodo.Category,
			newTodo.Content,
			newTodo.Env,
			newTodo.Expected,
		).Scan(&newTodo.ID, &newTodo.IsCompleted, &newTodo.CreatedAt)

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
		id := c.Param("id") // URLの末尾からIDを取得

		_, err := db.Exec("DELETE FROM todos WHERE id = $1", id)
		if err != nil {
			fmt.Printf("🚨 Delete Error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusNoContent) // 204 No Content を返す
	})

	// 手順を更新するAPI
	r.PUT("/todos/:id", func(c *gin.Context) {
		id := c.Param("id")
		var updatedTodo Todo

		if err := c.ShouldBindJSON(&updatedTodo); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		query := `UPDATE todos 
                  SET number=$1, category=$2, content=$3, env=$4, expected=$5, is_completed=$6 
                  WHERE id=$7`

		_, err := db.Exec(query,
			updatedTodo.Number, updatedTodo.Category, updatedTodo.Content,
			updatedTodo.Env, updatedTodo.Expected, updatedTodo.IsCompleted, id)

		if err != nil {
			fmt.Printf("🚨 Update Error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, updatedTodo)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // ローカル用のデフォルト
	}
	r.Run(":" + port)
}
