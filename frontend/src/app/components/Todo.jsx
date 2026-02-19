"use client";

import { useState, useEffect, useCallback } from "react";
import List from "./List";
import Form from "./Form";
import styles from "./Todo.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false); //起動中フラグ

  // データ取得ロジックを関数として定義
  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error("API接続失敗");
      
      const data = await response.json();
      setTodos(data || []);
      setIsWakingUp(false); // 成功したらフラグを下ろす
      setMounted(true);     // 画面を表示させる
    } catch (error) {
      console.error("Fetch error:", error);
      setIsWakingUp(true); // 失敗＝サーバーが寝ていると判断
      
      // 5秒後に自動リトライ（レベル1: 叩き起こし続ける）
      setTimeout(fetchTodos, 5000);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (newTodo) => {
    const { id, ...postData } = newTodo;
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
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
    try {
      const response = await fetch(`${API_URL}/todos/${updatedTodo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTodo),
      });
      if (response.ok) {
        setTodos(todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // 初回ロード中、またはスリープからの復帰待ちの表示
  if (!mounted || isWakingUp) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '50px' }}>
        <div className={styles.loader}></div> {/* 既存のCSSにloaderがあれば使用 */}
        <h2 style={{ color: '#555' }}>サーバーを起動しています...</h2>
        <p style={{ color: '#888', marginTop: '10px' }}>
          Renderの無料プランを使用しているため、起動に2,3分ほどかかる場合があります。<br />
          このまましばらくお待ちください。
        </p>
        {/* ローディングアニメーション（簡易版） */}
        <style jsx>{`
          div { font-family: sans-serif; }
          p { animation: pulse 2s infinite; }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
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