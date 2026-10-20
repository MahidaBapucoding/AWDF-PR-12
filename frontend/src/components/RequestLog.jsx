import { useEffect, useState } from 'react';
import { subscribeLogs, clearLogs } from '../api';

function RequestLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="request-log-box">
      <div className="request-log-header">
        <h3>Request Log</h3>
        {logs.length > 0 && (
          <button className="btn-clear-log" onClick={clearLogs}>
            Clear Log
          </button>
        )}
      </div>
      <div className="log-console">
        {logs.length === 0 ? (
          <div className="log-line empty">No API requests logged yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`log-line ${log.type}`}>
              {log.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RequestLog;
