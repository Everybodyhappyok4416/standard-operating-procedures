# 📋 開発・本番作業手順書管理アプリ (SOP Manager)

本アプリは、システム運用現場での作業ミスをゼロにすることを目指した、作業手順書管理システムです。  
単なるデータ管理に留まらず、インフラの制約下でのレジリエンス（回復性）と現場のユーザビリティの両立をテーマとしています。

---

## ● コンセプト
Render無料プランの仕様（15分間の無アクセスでスリープ）に対し、以下の設計で対応しています。

* **自動スリープ解除**: サーバー停止を検知すると、フロントエンドから自動でポーリング（再試行）を開始。
* **ステータス可視化**: 復帰待ちの間、ユーザーに現在の状況をアニメーションで通知し、離脱や「故障」という誤解を防ぎます。

---

## ● 技術スタック
* **フロントエンド**: React / Next.js (App Router)
* **バックエンド**: Go (Gin)
* **DB**: PostgreSQL (Supabase)
* **インフラ**: Render, Vercel (CI/CD連携)

---

## ● アーキテクチャ図
フロントエンド（Vercel）とバックエンド（Render/Supabase）の構成、およびデータの流れを示しています。

```mermaid
graph TD
    subgraph Client_Vercel
        FE[Next.js / TypeScript]
    end

    subgraph Server_Render
        BE[Go / Gin]
        RE[Retry Logic / polling]
    end

    subgraph Storage_Supabase
        DB[(PostgreSQL)]
    end

    User[作業員] --> FE
    FE -- "REST API (Fetch/JSON)" --> BE
    FE -. "Automatic Wake-up" .-> RE
    BE -- "GORM" --> DB
```

---


## ● データベース設計 (ER図)

```mermaid
erDiagram
    todos {
        id int8 "プライマリキー"
        created_at timestamptz "作成日時"
        number text "手順番号"
        category text "大項目/カテゴリ"
        env text "実行環境"
        expected text "期待値"
        content text "作業内容"
        is_completed bool "完了フラグ"
        completed_at text "完了時刻(証跡)"
    }
```

---


## ● 機能要件
* **フルCRUD機能**: 手順の作成、更新、追加、削除。
* **スリープ解除機能**: サーバーがスリープの場合、自動でリトライを繰り返し、復帰後にデータを反映。
* **レスポンシブローディング**: リトライ中に起動状況を通知するアニメーションを表示。

---

## ● 今後の改善ロードマップ

### 1. セキュリティ強化
* ログインAuth機能の追加
* 本番作業モードでの編集ロック機能

### 2. 運用自動化・証跡管理
* 作業完了時のログ記録と自動メール送信
* 各手順への完了ボタンおよびタイムスタンプ機能の追加

### 3. インフラの最適化
* Render由来のロジックをコンポーネント化して分離
* 「日付 ＞ 作業名 ＞ 手順書」の階層管理機能
* 手順の並べ替え機能追加
* 本番作業中の常時起動（キープアクティブ）機能の追加