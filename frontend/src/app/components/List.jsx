"use client";

import { useState } from "react";
import styles from "./Todo.module.css";

const List = ({ todos, deleteTodo, updateTodo, toggleTodo }) => {
  const [editingCell, setEditingCell] = useState({ id: null, key: null }); // 入力中の項目を記録
  const [tempValue, setTempValue] = useState(""); //入力中の内容の保持

  const handleDoubleClick = (todo, key) => {
    setEditingCell({ id: todo.id, key }); //inputタグへ切り替え
    setTempValue(todo[key]); // 編集開始時に元の値をtempにセット
  }; //todoは特定の一行、　mapで定義

  const handleBlur = (todo, key) => {
    // 値が変わっていたら特定のキーのみバックエンドに送る
    if (todo[key] !== tempValue) {
      updateTodo(todo.id, { [key]: tempValue }); //変更プロパティだけupdateTodoに渡す
    } //これらを引数としてupdateTodo関数が走る
    setEditingCell({ id: null, key: null });
  };

  // 完了状態と時刻をセットで更新するハンドラー
  const handleToggleComplete = (todo) => {
    toggleTodo(todo.id);
  };

  //各セルが編集中かどうか判別しinputかダブルクリックハンドラーを渡す
  const renderCell = (todo, key) => {
    const isEditing = editingCell.id === todo.id && editingCell.key === key;
    const cellClass = styles.td; //完了時にグレーアウト
    return (
      // 編集しないセルにはダブルクリックハンドラーを渡す
      <td
        className={cellClass}
        onDoubleClick={() => handleDoubleClick(todo, key)}
      >
        {isEditing ? (
          // 編集するセルにはinputを渡す
          <input
            autoFocus
            className={styles.input}
            value={tempValue} // 編集中の文字を表示
            onChange={(e) => setTempValue(e.target.value)} // 文字を打つたびにtempValueを更新
            onBlur={() => handleBlur(todo, key)} // カーソルが外れたら保存
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
        <tr
          key={todo.id}
          className={todo.is_completed ? styles.rowCompleted : ""}
        >
          {renderCell(todo, "number")}
          {renderCell(todo, "category")}
          {renderCell(todo, "content")}
          {renderCell(todo, "env")}
          {renderCell(todo, "expected")}
          {/* 完了チェックボックス */}
          <td className={styles.tdCenter}>
            <input
              type="checkbox"
              checked={todo.is_completed}
              onChange={() => handleToggleComplete(todo)}
            />
          </td>
          {/* 完了時刻列 */}
          <td className={styles.tdTime}>
            {todo.completed_at
              ? new Date(todo.completed_at).toLocaleString("ja-JP")
              : "-"}
          </td>
          <td className={styles.tdCenter}>
            <button
              className={styles.buttonDelete}
              onClick={() => deleteTodo(todo.id)}
            >
              削除
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default List;
