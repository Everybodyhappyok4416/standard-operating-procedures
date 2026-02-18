"use client";

import { useState, useEffect } from "react";
import List from "./List";
import Form from "./Form";
import styles from "./Todo.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`${API_URL}/todos`);
        if (!response.ok) throw new Error("API接続失敗");
        const data = await response.json();
        setTodos(data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setMounted(true);
      }
    };
    fetchTodos();
  }, []);

  const createTodo = async (newTodo) => {
    // 【重要】フロント側で仮のIDを作らず、DBに採番を任せる
    const { id, ...postData } = newTodo;
    try {
const response = await fetch(`${API_URL}/todos`,{
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
      const response = await fetch(`${API_URL}/todos/${updatedTodo.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTodo),
        },
      );
      if (response.ok) {
        setTodos(todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (!mounted) return null;

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

// ーーーーーー

// "use client";

// import { useState, useEffect } from "react";
// import List from "./List";
// import Form from "./Form";
// import styles from "./Todo.module.css";

// const Todo = () => {
//   // 1. 【状態管理】初期表示の不一致（Hydration Error）を防ぐため、最初は空配列で開始
//   const [todos, setTodos] = useState([]);
//   const [mounted, setMounted] = useState(false);

//   // 2. 【読み込み】GoのAPIからデータを取得
//   useEffect(() => {
//     const fetchTodos = async () => {
// try {
//         const response = await fetch("http://localhost:8080/todos");
//         if (!response.ok) throw new Error("API接続に失敗しました");
//         const data = await response.json();

//         // defaultTodosを使わず、DBのデータ（なければ空配列）をそのままセット
//         setTodos(data || []);
//       } catch (error) {
//         console.error("Fetch error:", error);
//       } finally {
//         setMounted(true);
//       }
//     };
//     fetchTodos();
//   }, []);

//   // 3. 【同期】LocalStorageへの保存ロジックは、DB移行に伴い一旦停止
//   /* useEffect(() => {
//     if (mounted) {
//       localStorage.setItem("procedure_todos", JSON.stringify(todos));
//     }
//   }, [todos, mounted]);
//   */

//   // --- ハンドラ関数（データの操作ロジック） ---

//   // 指定したIDの手順を削除
//   const deleteTodo = async (id) => {
//     try {
//       const response = await fetch(`http://localhost:8080/todos/${id}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) throw new Error("削除に失敗しました");

//       // DBで消えたら、画面からも消す
//       setTodos(todos.filter((t) => t.id !== id));
//     } catch (error) {
//       console.error("Delete error:", error);
//     }
//   };

//   // 新しい手順を追加
//   const createTodo = async (newTodo) => {
//     try {
//       const response = await fetch("http://localhost:8080/todos", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newTodo),
//       });

//       if (!response.ok) throw new Error("データの保存に失敗しました");

//       const savedTodo = await response.json();

//       // DB側でIDが振られた最新のデータを画面（State）に追加
//       setTodos([...todos, savedTodo]);
//     } catch (error) {
//       console.error("Create error:", error);
//       alert("保存に失敗しました。サーバーの状態を確認してください。");
//     }
//   };

//   // 手順の内容を更新（編集機能で使用）
//   const updateTodo = async (updatedTodo) => {
//     try {
//       const response = await fetch(
//         `http://localhost:8080/todos/${updatedTodo.id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(updatedTodo),
//         },
//       );

//       if (!response.ok) throw new Error("更新に失敗しました");

//       // DB側で更新できたら、画面のStateも更新
//       setTodos(todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)));
//     } catch (error) {
//       console.error("Update error:", error);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <table className={styles.table}>
//         <thead className={styles.thead}>
//           <tr>
//             <th className={styles.th}>番号</th>
//             <th className={styles.th}>大項目</th>
//             <th className={styles.th}>作業内容</th>
//             <th className={styles.th}>環境</th>
//             <th className={styles.th}>期待値</th>
//             <th className={styles.th}>操作</th>
//           </tr>
//         </thead>
//         {/* リスト表示とフォームにそれぞれ関数を渡す */}
//         <List todos={todos} deleteTodo={deleteTodo} updateTodo={updateTodo} />
//         <Form createTodo={createTodo} />
//       </table>
//     </div>
//   );
// };

// export default Todo;
