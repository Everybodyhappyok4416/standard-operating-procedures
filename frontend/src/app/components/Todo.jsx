"use client";

import { useState, useEffect, useCallback } from "react";
import List from "./List";
import Form from "./Form";
import styles from "./Todo.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
//backend　本番環境なら本番backend、開発環境ならローカル

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [mounted, setMounted] = useState(false);//空データ表示のチラつき抑止
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

      // 5秒後に自動リトライ
      setTimeout(fetchTodos, 5000);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); //データ取得を非同期処理

  const createTodo = async (newTodo) => {
    const { id, ...postData } = newTodo; //クライアント側で振ったIDを削除してDB側で採番
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, //go側にJSON型だと通知
        body: JSON.stringify(postData), //jsonに変換して送信
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "保存失敗");
      }

      const savedTodo = await response.json();
      setTodos([...todos, savedTodo]);
    } catch (error) {
      console.error("Create error:", error);
      alert(`保存失敗: ${error.message}`);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });
      if (response.ok) setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const updateTodo = async (updatedTodo) => {
    //updatedTodoは引数,{...todo, [key]: tempValue} がわたる
    try {
      const response = await fetch(`${API_URL}/todos/${updatedTodo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTodo),
      });
      if (response.ok) {
        setTodos(todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
      } //backendの処理を完了してからブラウザを更新する
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // バックエンドのスリープからの復帰待ちの表示
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
            <th className={styles.th}>番号</th>
            <th className={styles.th}>大項目</th>
            <th className={styles.th}>作業内容</th>
            <th className={styles.th}>環境</th>
            <th className={styles.th}>期待値</th>
            <th className={styles.th}>操作</th>
          </tr>
        </thead>
        <List todos={todos} deleteTodo={deleteTodo} updateTodo={updateTodo} />
        <Form createTodo={createTodo} />
      </table>
    </div>
  );
};

export default Todo;

//responseが配列ではなくエラーメッセージなら配列じゃないからmapなどでクラッシュする懸念
//useEffectは本当に必要か？
//saveを複数回連打したらDBに同じでーたいかない？
// ...todos, savedTodoでtodosが古いデータである可能性ない？
//保存時画面がフリーズしない？先に画面更新して裏で更新させない？

// 問い：もしBackendのGoサーバーが「別のPC」や「別のネットワーク」で動いていたらどうなるでしょうか？
// 今は自分のPCの中で完結しているので localhost で届きますが、本番環境では「ブラウザから見たBackendの住所」が正しく解決される必要があります。
// また、**CORS（Cross-Origin Resource Sharing）**という、ブラウザのセキュリティ機能が「React（3000番）からGo（8080番）への通信」を「怪しい！」と止めてしまうことがあります。
// この**「CORSの壁」をGo側でどう突破するか**、バックエンドの実装に興味はありますか？（Go側の設定コードについても解説可能です）
