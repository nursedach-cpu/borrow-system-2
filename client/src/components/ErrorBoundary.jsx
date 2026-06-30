import { Component } from 'react';

// Catches render-time crashes anywhere in the tree so a single component error
// shows a friendly recovery card instead of a blank white screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    // Surface to the console for debugging; not shown to the user.
    console.error('UI crashed:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] p-4">
          <div className="notion-card max-w-sm w-full text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-lg font-bold text-[var(--ink)] mb-1">เกิดข้อผิดพลาดในหน้านี้</h2>
            <p className="text-sm text-[var(--ink-soft)] mb-4">
              ขออภัย ระบบสะดุดชั่วคราว ลองกลับหน้าหลักแล้วทำรายการใหม่อีกครั้ง
            </p>
            <button onClick={this.handleReload} className="btn-primary w-full justify-center">
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
