"use client";

import { useState, useEffect, useCallback } from "react";
import List from "./List";
import Form from "./Form";
import styles from "./Todo.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
//backend　本番環境なら本番backend、開発環境ならローカル

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [mounted, setMounted] = useState(false); //空データ表示のチラつき抑止
  const [isWakingUp, setIsWakingUp] = useState(false); //起動中フラグ

  // データ取得ロジックを関数として定義
  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error("API接続失敗");
      const data = await response.json();
      setTodos(data || []); // 空配列を&で入れて他の関数がクラッシュしないように
      setIsWakingUp(false); // 成功したらフラグを下ろす
      setMounted(true); // 画面を表示させる
    } catch (error) {
      console.error("Fetch error:", error);
      setIsWakingUp(true); // 失敗＝サーバーが寝ていると判断
      setTimeout(fetchTodos, 5000); // 5秒後に自動リトライ
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); //データ取得を非同期処理


//---------------------------追加機能-----------------------------
  const createTodo = async (newTodo) => {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        //todos tableにpostDataを送信
        method: "POST",
        headers: { "Content-Type": "application/json" }, //go側にJSON型だと通知
        body: JSON.stringify(newTodo), //jsonに変換して送信
      });
      if (!response.ok) throw new Error("保存失敗");
      const savedTodo = await response.json();

      // 提案の設計を反映
      setTodos((prev) => [...prev, savedTodo]);
    } catch (error) {
      alert(error.message);
    }
  };

  // トグル：DBを正とし、レスポンスでStateを更新
  const toggleTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}/toggle`, {
        method: "PATCH",
      });
      if (response.ok) {
        const updatedTodo = await response.json();
        // 既存の配列内の該当IDだけを差し替える
        setTodos((prev) =>
          prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
        );
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  //---------------------------削除機能-----------------------------
  const deleteTodo = async (id) => {
    const ok = window.confirm(
      "この作業手順を削除してもよろしいですか？\n※削除したデータは復元できません。",
    );
    if (!ok) return;
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } else {
        throw new Error("削除に失敗しました。");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  
  //---------------------------更新機能-----------------------------
  const updateTodo = async (todoId, changes) => {
    // 変更対象の元のデータを取得して version を取り出す
    const originalTodo = todos.find((t) => t.id === todoId);
    if (!originalTodo) return;
    try {
      const response = await fetch(`${API_URL}/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...changes, version: originalTodo.version }),
      });
      if (response.status === 409) {
        alert(
          "🚨 競合エラー: 他のユーザーが更新しました。最新データを読み込みます。",
        );
        fetchTodos(); // サーバーと同期
        return;
      }
      if (response.ok) {
        const savedTodo = await response.json();
        // サーバーから返ってきた最新の version を含むオブジェクトで同期
        setTodos((prev) =>
          prev.map((t) => (t.id === savedTodo.id ? savedTodo : t)),
        );
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  //-------------バックエンドのスリープからの復帰待ちの表示---------------------
  if (!mounted || isWakingUp) {
    return (
      <div
        className={styles.container}
        style={{ textAlign: "center", padding: "50px" }}
      >
        <div className={styles.loader}></div>{" "}
        <h2 style={{ color: "#555" }}>サーバーを起動しています...</h2>
        <p style={{ color: "#888", marginTop: "10px" }}>
          Renderの無料プランを使用しているため、起動に2,3分ほどかかる場合があります。
          <br />
          このまましばらくお待ちください。
        </p>
        {/* ローディングアニメーション */}
        <style jsx>{`
          div {
            font-family: sans-serif;
          }
          p {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={`${styles.th} ${styles.colNumber}`}>番号</th>
            <th className={`${styles.th} ${styles.colCategory}`}>項目</th>
            <th className={`${styles.th} ${styles.colContent}`}>作業内容</th>
            <th className={`${styles.th} ${styles.colEnv}`}>環境</th>
            <th className={`${styles.th} ${styles.colExpected}`}>期待値</th>
            <th className={`${styles.th} ${styles.colCheck}`}>完了</th>
            <th className={`${styles.th} ${styles.colTime}`}>完了時刻</th>
            <th className={`${styles.th} ${styles.colAction}`}>操作</th>
          </tr>
        </thead>
        <List
          todos={todos}
          deleteTodo={deleteTodo}
          updateTodo={updateTodo}
          toggleTodo={toggleTodo}
        />
        <Form createTodo={createTodo} />
      </table>
    </div>
  );
};

export default Todo;
