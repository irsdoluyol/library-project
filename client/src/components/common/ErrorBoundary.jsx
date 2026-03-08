import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.root}>
          <h1 className={styles.title}>Что-то пошло не так</h1>
          <p className={styles.text}>
            Произошла ошибка. Попробуйте обновить страницу.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
