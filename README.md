# 📋 開発・本番作業手順書管理アプリ (SOP Manager)

システム運用の現場における「作業ミス・事故ゼロ」を目指した、実戦型の手順書管理アプリケーションです。  
単なるCRUDアプリではなく、**DBを唯一の真実（Single Source of Truth）とする設計**を採用し、マルチユーザー環境でのデータ整合性を担保するため **楽観的ロック（Optimistic Locking）** を実装しています。


---

## ● コンセプト
Render無料プランの仕様（15分間の無アクセスでスリープ）に対し、以下の設計で対応しています。

* **自動スリープ解除**: サーバー停止を検知すると、フロントエンドから自動でポーリング（再試行）を開始。
* **ステータス可視化**: スリープ解除中はローディングアニメーションを表示し、  
ユーザーが「アプリが故障している」と誤解することを防ぎます。

---

## ● 技術スタック
| Layer | Technology |
|------|------|
| Frontend | React / Next.js (App Router) |
| Backend | Go (Gin) |
| Database | PostgreSQL (Supabase) |
| Infrastructure | Render / Vercel |
| CI/CD | GitHub |

---

## ● アーキテクチャ図
本アプリでは **DBを唯一の状態管理ソース（Source of Truth）** として扱います。  
フロントエンドのStateはUI表示用のキャッシュとして扱い、状態遷移はバックエンドで管理します。

```mermaid
graph TD
    subgraph "Client (Vercel)"
        FE[Next.js App]
        Retry[Auto Retry Logic]
    end

    subgraph "Server (Render)"
        BE[Go / Gin API]
        Lock[Optimistic Locking]
    end

    subgraph "Storage (Supabase)"
        DB[(PostgreSQL)]
    end

    User[作業員A / 作業員B] --> FE
    FE -- PATCH /todos/:id --> BE
    BE -- version check --> DB
    DB -- success / conflict --> BE
    BE --> FE
    FE -. wake-up polling .-> Retry
```

---

## ● データベース設計 (ER図)

```mermaid
erDiagram
    todos {
        int id PK "SERIAL"
        text number "手順番号 (1.1等)"
        text category "大項目 (DB等)"
        text content "作業内容"
        text env "実行環境"
        text expected "期待値"
        boolean is_completed "完了フラグ"
        timestamptz completed_at "完了時刻(証跡)"
        timestamptz created_at "作成日時"
        timestamptz updated_at "最終更新日時"
        int version "楽観的ロック用"
    }
```

---

## ● 主要API一覧 (REST API)
バックエンド（Go / Gin）が提供するエンドポイントです。

| Method | Endpoint | Description |
|------|------|------|
| GET | /todos | 手順一覧取得 |
| POST | /todos | 手順作成 |
| PATCH | /todos/:id | 手順編集（楽観ロック） |
| PATCH | /todos/:id/toggle | 完了状態トグル |
| DELETE | /todos/:id | 手順削除 |

---

## ● ローカル起動手順
本プロジェクトをローカル環境で起動する方法です。

### 1. データベース準備 (Supabase)
1. Supabaseでプロジェクトを作成し、`todos` テーブルを作成します。
2. カラム構成は上述の **ER図** に合わせて設定してください。

### 2. フロントエンド起動 (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 3. バックエンド起動 (Go)
```bash
cd backend
# 環境変数の設定 (.env)
# DB_URL=postgresql://user:pass@host:5432/dbname
go run main.go
```

---


## ● 機能要件
* **フルCRUD機能**: 手順の作成、更新、追加、削除。
* **完了フラグ管理**: 
* **楽観ロックによる競合回避**: 
* **スリープ解除機能**: サーバーがスリープの場合、自動でリトライを繰り返し、復帰後にデータを反映。
* **レスポンシブローディング**: リトライ中に起動状況を通知するアニメーションを表示。

---

## ● 今後の改善ロードマップ

### 1. セキュリティ強化
* ログインAuth機能の追加
* 本番作業モードでの編集ロック機能

### 2. 運用自動化・証跡管理
* 作業完了時のログ記録と自動メール送信

### 3. インフラの最適化
* Render由来のロジックをコンポーネント化して分離
* 「日付 ＞ 作業名 ＞ 手順書」の階層管理機能
* 手順の並べ替え機能追加
* 本番作業中のDB常時起動（キープアクティブ）機能の追加