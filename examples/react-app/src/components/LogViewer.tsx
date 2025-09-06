import React, { useEffect, useRef } from 'react';

interface LogViewerProps {
  logs: string[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleClearLogs = () => {
    // This would need to be passed up to parent component
    console.log('Clear logs requested');
  };

  const handleCopyLogs = () => {
    const logText = logs.join('\n');
    navigator.clipboard
      .writeText(logText)
      .then(() => {
        console.log('Logs copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy logs:', err);
      });
  };

  const formatLog = (log: string) => {
    if (log.includes('✅')) {
      return { color: '#28a745', icon: '✅' };
    } else if (log.includes('❌')) {
      return { color: '#dc3545', icon: '❌' };
    } else if (log.includes('📊')) {
      return { color: '#007bff', icon: '📊' };
    } else if (log.includes('🐛')) {
      return { color: '#ffc107', icon: '🐛' };
    } else if (log.includes('👤')) {
      return { color: '#6f42c1', icon: '👤' };
    } else if (log.includes('💰')) {
      return { color: '#28a745', icon: '💰' };
    } else if (log.includes('⏳')) {
      return { color: '#6c757d', icon: '⏳' };
    } else {
      return { color: '#17a2b8', icon: 'ℹ️' };
    }
  };

  return (
    <div className="demo-section">
      <h2>📝 Activity Log</h2>
      <p>Real-time log of all tracking operations and their results.</p>

      <div className="button-group">
        <button onClick={handleCopyLogs} disabled={logs.length === 0}>
          📋 Copy Logs
        </button>
        <button onClick={handleClearLogs} disabled={logs.length === 0}>
          🗑️ Clear Logs
        </button>
        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>{logs.length} entries</span>
      </div>

      <div className="log-output">
        {logs.length === 0 ? (
          <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            No activity yet. Initialize the tracking system and try the demo features above.
          </div>
        ) : (
          logs.map((log, index) => {
            const format = formatLog(log);
            return (
              <div
                key={index}
                style={{
                  marginBottom: '4px',
                  color: format.color,
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                }}
              >
                <span style={{ minWidth: '16px', textAlign: 'center' }}>{format.icon}</span>
                <span style={{ flex: 1 }}>{log.replace(/^[⏳📊❌✅🐛👤💰ℹ️🛡️📋📄🏷️🍞💥🔧🌐📝🔍⚛️🔄]\s*/, '')}</span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <h4>💡 Log Legend:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '5px' }}>
          <div>
            <span style={{ color: '#28a745' }}>✅</span> Success operations
          </div>
          <div>
            <span style={{ color: '#dc3545' }}>❌</span> Failed operations
          </div>
          <div>
            <span style={{ color: '#007bff' }}>📊</span> Analytics tracking
          </div>
          <div>
            <span style={{ color: '#ffc107' }}>🐛</span> Error logging
          </div>
          <div>
            <span style={{ color: '#6f42c1' }}>👤</span> User identification
          </div>
          <div>
            <span style={{ color: '#28a745' }}>💰</span> Revenue tracking
          </div>
          <div>
            <span style={{ color: '#6c757d' }}>⏳</span> Processing
          </div>
          <div>
            <span style={{ color: '#17a2b8' }}>ℹ️</span> Information
          </div>
        </div>
      </div>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <strong>💡 Pro Tip:</strong> Open your browser's developer console (F12) to see the actual tracking calls being
        made to analytics providers.
      </div>
    </div>
  );
};

export default LogViewer;
