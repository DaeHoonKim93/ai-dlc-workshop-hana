import React from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <h2 className={styles.title}>오류가 발생했습니다</h2>
          <p className={styles.message}>
            예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <button className={styles.retryBtn} onClick={this.handleReset} type="button">
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
