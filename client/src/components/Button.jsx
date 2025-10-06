export default function Button({ children, onClick, variant = "primary" }) {
  const styles = {
    primary: "bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700",
    secondary: "bg-gray-200 text-black px-4 py-2 rounded-xl hover:bg-gray-300",
  };

  return (
    <button onClick={onClick} className={styles[variant]}>
      {children}
    </button>
  );
}
