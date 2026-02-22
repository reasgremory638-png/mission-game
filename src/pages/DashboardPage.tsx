import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Challenge } from '../types';
import { Button } from '../components/Button';
import { Card, CardBody, CardHeader, CardFooter } from '../components/Card';
import { Island } from '../components/Island';
import { Modal } from '../components/Modal';
import { Input, Textarea } from '../components/Input';
import './Dashboard.css';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const user = useAppStore((s) => s.user);
  const challenges = useAppStore((s) => s.challenges);
  const currentChallenge = useAppStore((s) => s.currentChallenge);
  const createChallenge = useAppStore((s) => s.createChallenge);
  const setCurrentChallenge = useAppStore((s) => s.setCurrentChallenge);
  const getActiveChallenges = useAppStore((s) => s.getActiveChallenges);
  const getCompletedChallenges = useAppStore((s) => s.getCompletedChallenges);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    executionDetails: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.executionDetails) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createChallenge(
        formData.title,
        formData.description,
        formData.executionDetails,
        Date.now()
      );

      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        executionDetails: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeChallenges = getActiveChallenges();
  const completedChallenges = getCompletedChallenges();

  const completionPercentage = currentChallenge
    ? (currentChallenge.days.filter((d) => d.status === 'completed' || d.status === 'compensated')
        .length /
        currentChallenge.totalDays) *
      100
    : 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏝️ Mission Visual</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => window.location.href = '#settings'}>
            ⚙️ Settings
          </Button>
          <Button variant="danger" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="dashboard-content">
        {currentChallenge && currentChallenge.status === 'active' ? (
          <>
            <section className="island-section">
              <Island
                completionPercentage={completionPercentage}
                missedDaysCount={currentChallenge.missedDays.length}
                totalDays={currentChallenge.totalDays}
              />
            </section>

            <section className="challenge-section">
              <Card>
                <CardHeader>
                  <h2>{currentChallenge.title}</h2>
                </CardHeader>
                <CardBody>
                  <p className="challenge-description">
                    {currentChallenge.description}
                  </p>
                  <p className="challenge-execution">
                    <strong>How to Execute:</strong> {currentChallenge.executionDetails}
                  </p>

                  <div className="progress-stats">
                    <div className="stat-box">
                      <span className="stat-label">Completed</span>
                      <span className="stat-number">
                        {currentChallenge.days.filter((d) => d.status === 'completed' || d.status === 'compensated').length}
                        /{currentChallenge.totalDays}
                      </span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Missed</span>
                      <span className="stat-number" style={{ color: 'var(--error)' }}>
                        {currentChallenge.missedDays.length}
                      </span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Remaining</span>
                      <span className="stat-number">
                        {currentChallenge.days.filter((d) => d.status === 'pending').length}
                      </span>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </CardBody>
              </Card>
            </section>

            <section className="daily-tasks-section">
              <h2>Daily Tasks</h2>
              <div className="days-grid">
                {currentChallenge.days.map((day, index) => (
                  <motion.div
                    key={day.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DayCard
                      day={day}
                      challengeId={currentChallenge.id}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="no-challenge-section">
            <Card>
              <CardBody>
                <div className="empty-state">
                  <h2>🚀 No Active Challenge</h2>
                  <p>Start your first 30-day challenge today and transform your habits!</p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create New Challenge
                  </Button>
                </div>
              </CardBody>
            </Card>
          </section>
        )}

        <section className="challenges-overview">
          <div className="overview-grid">
            {activeChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <h3>Active Challenges ({activeChallenges.length})</h3>
                </CardHeader>
                <CardBody>
                  {activeChallenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      onClick={() => setCurrentChallenge(challenge.id)}
                      className="challenge-item clickable"
                      whileHover={{ x: 4 }}
                    >
                      <strong>{challenge.title}</strong>
                      <span className="challenge-progress">
                        {Math.floor(
                          (challenge.days.filter(
                            (d) => d.status === 'completed' || d.status === 'compensated'
                          ).length /
                            challenge.totalDays) *
                          100
                        )}
                        %
                      </span>
                    </motion.div>
                  ))}
                </CardBody>
              </Card>
            )}

            {completedChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <h3>Completed Challenges ({completedChallenges.length})</h3>
                </CardHeader>
                <CardBody>
                  {completedChallenges.map((challenge) => (
                    <div key={challenge.id} className="challenge-item completed">
                      <strong>{challenge.title}</strong>
                      <span className="badge">✓ Completed</span>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <h3>Create New Challenge</h3>
            </CardHeader>
            <CardBody>
              <p className="text-secondary">
                Ready to build a new skill? Create a fresh 30-day challenge.
              </p>
            </CardBody>
            <CardFooter>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                Start New Challenge
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New 30-Day Challenge"
        size="lg"
      >
        <form onSubmit={handleCreateChallenge} className="create-challenge-form">
          <Input
            label="Challenge Title"
            placeholder="e.g., Read 30 Pages Daily"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <Textarea
            label="Challenge Description"
            placeholder="Describe the goal and why it matters to you..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <Textarea
            label="How to Execute"
            placeholder="Describe the steps and execution details..."
            value={formData.executionDetails}
            onChange={(e) =>
              setFormData({ ...formData, executionDetails: e.target.value })
            }
          />

          <div className="form-actions">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Day Card Component
interface DayCardProps {
  day: any;
  challengeId: string;
}

const DayCard: React.FC<DayCardProps> = ({ day, challengeId }) => {
  const markDayAsCompleted = useAppStore((s) => s.markDayAsCompleted);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState(day.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkComplete = async () => {
    setIsSubmitting(true);
    await markDayAsCompleted(challengeId, day.dayNumber, note, []);
    setShowModal(false);
    setIsSubmitting(false);
  };

  const getStatusIcon = () => {
    switch (day.status) {
      case 'completed':
        return '✅';
      case 'missed':
        return '❌';
      case 'compensated':
        return '🔄';
      default:
        return '⭕';
    }
  };

  const getStatusClass = () => {
    return `day-card-${day.status}`;
  };

  return (
    <>
      <Card
        className={`day-card ${getStatusClass()}`}
        onClick={() => day.status === 'pending' && setShowModal(true)}
      >
        <CardBody style={{ textAlign: 'center' }}>
          <div className="day-number">Day {day.dayNumber}</div>
          <div className="day-status">{getStatusIcon()}</div>
          {day.status === 'pending' && (
            <button
              className="day-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              Mark Done
            </button>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Day ${day.dayNumber} - Complete Task`}
        size="md"
      >
        <div className="day-modal-form">
          <Textarea
            label="Daily Note"
            placeholder="What did you accomplish today?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleMarkComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Mark as Completed'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
