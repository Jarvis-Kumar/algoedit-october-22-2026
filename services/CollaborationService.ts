
import { Project, ProjectVersion, ActivityLog, CollaboratorPresence, User, ProjectRole } from '../types';

export class CollaborationService {
  private static STORAGE_KEY = 'ai-media-studio-projects';

  static getProjects(): Project[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getProject(id: string): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  static saveProject(project: Project) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
  }

  static createSnapshot(project: Project, user: User, summary: string): Project {
    const newVersion: ProjectVersion = {
      id: Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      versionNumber: project.versionHistory.length + 1,
      timestamp: Date.now(),
      authorId: user.email,
      authorName: user.name,
      changeSummary: summary,
      state: JSON.parse(JSON.stringify(project.currentState))
    };

    const updatedProject: Project = {
      ...project,
      versionHistory: [...project.versionHistory, newVersion],
      lastUpdate: new Date().toISOString()
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  static restoreVersion(project: Project, versionId: string, user: User): Project {
    const version = project.versionHistory.find(v => v.id === versionId);
    if (!version) return project;

    // Save current state as a snapshot before restoring
    const preRestoreProject = this.createSnapshot(project, user, `Auto-snapshot before restoring V${version.versionNumber}`);

    const restoredProject: Project = {
      ...preRestoreProject,
      currentState: JSON.parse(JSON.stringify(version.state)),
      lastUpdate: new Date().toISOString()
    };

    this.trackActivity(restoredProject, user, 'restore', `Restored project to Version ${version.versionNumber}`);
    this.saveProject(restoredProject);
    return restoredProject;
  }

  static trackActivity(project: Project, user: User, type: ActivityLog['type'], description: string, elementId?: string, before?: any, after?: any): Project {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      projectId: project.id,
      userId: user.email,
      userName: user.name,
      timestamp: Date.now(),
      type,
      description,
      elementId,
      beforeState: before,
      afterState: after
    };

    const updatedProject: Project = {
      ...project,
      activityLogs: [newLog, ...project.activityLogs].slice(0, 100) // Keep last 100 logs
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  // Mocked Real-time Sync
  static simulateRemoteEdit(project: Project, remoteUser: { name: string, email: string }): Project {
    // Simulate a remote user making a change
    const updatedState = { ...project.currentState, lastRemoteEdit: Date.now() };
    return this.trackActivity(
      { ...project, currentState: updatedState },
      { name: remoteUser.name, email: remoteUser.email } as User,
      'edit',
      `Modified ${project.name} properties`
    );
  }

  static getMockCollaborators(): CollaboratorPresence[] {
    return [
      {
        userId: 'sarah@example.com',
        userName: 'Sarah Chen',
        cursor: { x: 150, y: 300 },
        activeElementId: 'header-1',
        lastActive: Date.now(),
        color: '#f43f5e' // rose-500
      },
      {
        userId: 'marcus@example.com',
        userName: 'Marcus Aurelius',
        cursor: { x: 450, y: 120 },
        activeElementId: 'image-container',
        lastActive: Date.now(),
        color: '#8b5cf6' // violet-500
      }
    ];
  }
}
