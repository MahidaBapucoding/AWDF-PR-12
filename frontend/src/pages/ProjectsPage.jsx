function ProjectsPage({ tasks = [] }) {
  const pending = tasks.filter((t) => !t.completed).length;
  const inProgress = tasks.filter((t) => !t.completed && t.priority === 'high').length;
  const completed = tasks.filter((t) => t.completed).length;

  const maxVal = Math.max(pending, inProgress, completed, 5);

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Projects</h2>
        <p className="page-desc">Overview of active projects and task status metrics.</p>
      </div>

      <div className="card chart-card">
        <h3>Task Progress</h3>
        <div className="chart-container">
          <div className="bar-group">
            <div
              className="bar bar-pending"
              style={{ height: `${(pending / maxVal) * 160 + 20}px` }}
            >
              <span className="bar-val">{pending}</span>
            </div>
            <div className="bar-label">Pending</div>
          </div>

          <div className="bar-group">
            <div
              className="bar bar-progress"
              style={{ height: `${(inProgress / maxVal) * 160 + 20}px` }}
            >
              <span className="bar-val">{inProgress}</span>
            </div>
            <div className="bar-label">In Progress</div>
          </div>

          <div className="bar-group">
            <div
              className="bar bar-completed"
              style={{ height: `${(completed / maxVal) * 160 + 20}px` }}
            >
              <span className="bar-val">{completed}</span>
            </div>
            <div className="bar-label">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectsPage;
