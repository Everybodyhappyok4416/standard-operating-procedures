"use client";

import { useState } from "react";
import styles from "./Todo.module.css";

const List = ({ todos, deleteTodo, updateTodo }) => {
  const [editingCell, setEditingCell] = useState({ id: null, key: null }); // 入力中の項目を記録
  const [tempValue, setTempValue] = useState(""); //入力中の内容の保持

  const handleDoubleClick = (todo, key) => {
    setEditingCell({ id: todo.id, key }); //inputタグへ切り替え
    setTempValue(todo[key]); // 編集開始時に元の値をtempにセット
  }; //todoは特定の一行、　mapで定義

  const handleBlur = (todo, key) => {
    // 値が変わっていたらバックエンドに送る
    if (todo[key] !== tempValue) {
      updateTodo({ ...todo, [key]: tempValue }); //値変わらないなら無駄な通信しない
    } //これらを引数としてupdateTodo関数が走る
    setEditingCell({ id: null, key: null });
  };

  //各セルが編集中かどうか判別しinputかダブルクリックハンドラーを渡す
  const renderCell = (todo, key) => {
    const isEditing = editingCell.id === todo.id && editingCell.key === key;

    return (
      // 編集しないセルにはハンドラーを渡す
      <td
        className={styles.td}
        onDoubleClick={() => handleDoubleClick(todo, key)}
      >
        {isEditing ? (
        // 編集するセルにはinputを渡す
          <input
            autoFocus
            className={styles.input}
            value={tempValue} // 編集中の文字を表示
            onChange={(e) => setTempValue(e.target.value)} // 文字を打つたびにtempValueを更新
            onBlur={() => handleBlur(todo, key)} // 外れたら保存
            onKeyDown={(e) => e.key === "Enter" && e.target.blur()} // Enterでも保存
          />
        ) : (
          todo[key]
        )}
      </td>
    );
  };

  return (
    <tbody>
      {todos.map((todo) => (
        <tr key={todo.id}>
          {renderCell(todo, "number")}
          {renderCell(todo, "category")}
          {renderCell(todo, "content")}
          {renderCell(todo, "env")}
          {renderCell(todo, "expected")}
          <td className={styles.td} style={{ textAlign: "center" }}>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default List;

// もし通信（PUT）に失敗したら、画面はどうなりますか？
// 今の List.js のコードでは、handleBlur が動いた瞬間に setEditingCell({ id: null, key: null }) が実行され、入力モードが終了します。
// しかし、親の updateTodo で通信に失敗しても、子（List.js）はその失敗を知る術がありません。ユーザーから見ると「書き換えたつもりなのに、リロードしたら元に戻っていた」という不整合が起きます。
