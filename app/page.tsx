'use client'

import React, { useEffect } from 'react';
import { useAppStore } from '@/services/store';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContextInspector } from '@/components/layout/ContextInspector';
import { NotificationDrawer } from '@/components/layout/NotificationDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignUpPage } from '@/components/auth/SignUpPage';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { ProjectOverviewView } from '@/components/project/ProjectOverviewView';
import { AiChatView } from '@/components/project/AiChatView';
import { DocumentsView } from '@/components/project/DocumentsView';
import { RequirementsView } from '@/components/project/RequirementsView';
import { ConflictsView } from '@/components/project/ConflictsView';
import { TasksView } from '@/components/project/TasksView';
import { GitHubView } from '@/components/project/GitHubView';
import { KnowledgeView } from '@/components/project/KnowledgeView';
import { MemoryView } from '@/components/project/MemoryView';
import { UnifiedSearchView } from '@/components/project/UnifiedSearchView';
import { SettingsView } from '@/components/project/SettingsView';
import { Brain, RefreshCw } from 'lucide-react';
import { KnowledgeType } from '@/types';


export default function Home() {
  const store = useAppStore();
  const hydrateStore = useAppStore((state) => state.hydrateStore);
  const setActiveSection = useAppStore((state) => state.setActiveSection);

  // Trigger state hydration upon client mount
  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  // Keyboard shortcut Ctrl+K / Cmd+K Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveSection('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveSection]);

  // Premium Hydration/Mount check to prevent SSR mismatch
  if (!store.isHydrated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Booting intelligence workspace...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Route page views
  if (store.currentPage === 'landing') {
    return (
      <LandingPage
        onNavigateToLogin={() => store.setCurrentPage('login')}
        onNavigateToSignUp={() => store.setCurrentPage('signup')}
        onNavigateToApp={() => {
          store.setCurrentPage('app');
          store.setActiveSection('projects');
        }}
      />
    );
  }

  if (store.currentPage === 'login') {
    return (
      <LoginPage
        onNavigateToSignUp={() => store.setCurrentPage('signup')}
        onNavigateToLanding={() => store.setCurrentPage('landing')}
        onLoginSuccess={(userProfile) => {
          // Store's hydrate system updates it, but we can set manually
          useAppStore.setState({ user: userProfile });
          store.setCurrentPage('app');
          store.setActiveSection('projects');
        }}
      />
    );
  }

  if (store.currentPage === 'signup') {
    return (
      <SignUpPage
        onNavigateToLogin={() => store.setCurrentPage('login')}
        onNavigateToLanding={() => store.setCurrentPage('landing')}
        onSignUpSuccess={(userProfile) => {
          useAppStore.setState({ user: userProfile });
          store.setCurrentPage('app');
          store.setActiveSection('projects');
        }}
      />
    );
  }

  // Primary workspace variables
  const currentProject = store.projects.find((p) => p.id === store.currentProjectId);
  const selectedRequirementTitle = store.requirements.find((r) => r.id === store.selectedRequirementId)?.title;
  const selectedTaskTitle = store.tasks.find((t) => t.id === store.selectedTaskId)?.title;
  const activeConflictsCount = store.conflicts.filter(
    (c) => c.status === 'Active' || c.status === 'Investigating'
  ).length;

  const activeConversation = store.conversations.find((c) => c.id === store.activeConversationId);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden select-none transition-colors">
      {/* Top Application Header */}
      <Header
        currentProject={currentProject}
        projects={store.projects}
        onSelectProject={store.selectProject}
        onOpenCreateProject={() => store.setIsCreateProjectModalOpen(true)}
        activeSection={store.activeSection}
        onNavigateSection={store.setActiveSection}
        user={store.user}
        onOpenAuth={() => store.setIsAuthModalOpen(true)}
        notifications={store.notifications}
        onOpenNotifications={() => store.setIsNotificationsOpen(true)}
        workflowJobs={store.workflowJobs}
        onToggleMobileSidebar={() => store.setIsMobileSidebarOpen(!store.isMobileSidebarOpen)}
        aiJobState={store.aiJobState}
        onSimulateJobState={store.simulateJobState}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Project Navigation Sidebar */}
        <div
          className={`${
            store.isMobileSidebarOpen ? 'block fixed inset-y-0 left-0 z-40 mt-14' : 'hidden'
          } lg:block h-full`}
        >
          <Sidebar
            currentProject={currentProject}
            activeSection={store.activeSection}
            onNavigateSection={store.setActiveSection}
            isCollapsed={store.isSidebarCollapsed}
            onToggleCollapse={() => store.setIsSidebarCollapsed(!store.isSidebarCollapsed)}
            activeConflictsCount={activeConflictsCount}
          />
        </div>

        {/* Primary View Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
          {/* Universal Dynamic Breadcrumbs Navigation */}
          <Breadcrumbs
            currentProject={currentProject}
            activeSection={store.activeSection}
            selectedRequirementId={store.selectedRequirementId}
            selectedRequirementTitle={selectedRequirementTitle}
            selectedTaskId={store.selectedTaskId}
            selectedTaskTitle={selectedTaskTitle}
            onNavigateSection={store.setActiveSection}
            onClearArtifactSelection={() => {
              store.setSelectedRequirementId(null);
              store.setSelectedTaskId(null);
            }}
          />

          {store.activeSection === 'projects' && (
            <DashboardView
              projects={store.projects}
              user={store.user}
              onSelectProject={store.selectProject}
              onOpenCreateProject={() => store.setIsCreateProjectModalOpen(true)}
            />
          )}

          {store.activeSection === 'overview' && (
            currentProject ? (
              <ProjectOverviewView
                project={currentProject}
                documents={store.documents}
                requirements={store.requirements}
                conflicts={store.conflicts}
                tasks={store.tasks}
                githubInfo={store.githubInfo}
                knowledgeEntities={store.knowledgeEntities}
                memories={store.memories}
                onNavigateSection={store.setActiveSection}
                onNavigateToRequirement={(reqId) => {
                  store.setSelectedRequirementId(reqId);
                  store.setActiveSection('requirements');
                }}
                onNavigateToTask={(taskId) => {
                  store.setSelectedTaskId(taskId);
                  store.setActiveSection('tasks');
                }}
                onNavigateToConflict={() => {
                  store.setActiveSection('conflicts');
                }}
                onNavigateToDocument={() => {
                  store.setActiveSection('documents');
                }}
              />
            ) : (
              <DashboardView
                projects={store.projects}
                user={store.user}
                onSelectProject={store.selectProject}
                onOpenCreateProject={() => store.setIsCreateProjectModalOpen(true)}
              />
            )
          )}

          {store.activeSection === 'chat' && currentProject && (
            <AiChatView
              project={currentProject}
              conversations={store.conversations}
              activeConversation={activeConversation}
              onSelectConversation={store.setActiveConversationId}
              onNewConversation={store.newConversation}
              onDeleteConversation={store.deleteConversation}
              onToggleContextInspector={() => store.setIsContextInspectorOpen(!store.isContextInspectorOpen)}
              isContextInspectorOpen={store.isContextInspectorOpen}
              activeContext={store.inspectorContext}
              onSetContextForInspector={(ctx, reasoning, tools) => {
                store.setInspectorData(ctx, reasoning, tools);
              }}
            />
          )}

          {store.activeSection === 'documents' && currentProject && (
            <DocumentsView
              project={currentProject}
              documents={store.documents}
              onAddDocument={store.addDocument}
              onDeleteDocument={store.deleteDocument}
            />
          )}

          {store.activeSection === 'requirements' && currentProject && (
            <RequirementsView
              project={currentProject}
              requirements={store.requirements}
              tasks={store.tasks}
              documents={store.documents}
              conflicts={store.conflicts}
              selectedRequirementId={store.selectedRequirementId}
              onAddRequirement={store.addRequirement}
              onUpdateRequirement={store.updateRequirement}
              onDeleteRequirement={store.deleteRequirement}
              onNavigateToTask={(taskId) => {
                store.setSelectedTaskId(taskId);
                store.setActiveSection('tasks');
              }}
              onNavigateToDocument={() => {
                store.setActiveSection('documents');
              }}
              onNavigateToConflict={() => {
                store.setActiveSection('conflicts');
              }}
              onAddTask={store.addTask}
            />
          )}

          {store.activeSection === 'conflicts' && currentProject && (
            <ConflictsView
              project={currentProject}
              conflicts={store.conflicts}
              onResolveConflict={store.resolveConflict}
            />
          )}

          {store.activeSection === 'tasks' && currentProject && (
            <TasksView
              project={currentProject}
              tasks={store.tasks}
              requirements={store.requirements}
              documents={store.documents}
              selectedTaskId={store.selectedTaskId}
              onAddTask={store.addTask}
              onUpdateTaskStatus={store.updateTaskStatus}
              onUpdateTask={store.updateTask}
              onDeleteTask={store.deleteTask}
              onNavigateToRequirement={(reqId) => {
                store.setSelectedRequirementId(reqId);
                store.setActiveSection('requirements');
              }}
              onNavigateToDocument={() => {
                store.setActiveSection('documents');
              }}
            />
          )}

          {store.activeSection === 'github' && currentProject && (
            <GitHubView
              project={currentProject}
              githubInfo={store.githubInfo}
              onRefreshSync={() => {
                store.updateProject(currentProject.id, {});
              }}
            />
          )}

          {store.activeSection === 'knowledge' && currentProject && (
            <KnowledgeView
              project={currentProject}
              knowledgeEntities={store.knowledgeEntities}
              onAddEntity={(ent) => store.addKnowledge({
                name: ent.name,
                type: ent.type as KnowledgeType,
                description: ent.description,
                relatedEntityIds: ent.relatedEntityIds,
              })}
              onDeleteEntity={store.deleteKnowledge}
            />
          )}

          {store.activeSection === 'memory' && currentProject && (
            <MemoryView
              project={currentProject}
              memories={store.memories}
              onAddMemory={(mem) => store.addMemory({
                summary: mem.summary,
                type: mem.type,
                content: mem.content,
              })}
              onDeleteMemory={store.deleteMemory}
            />
          )}

          {store.activeSection === 'search' && (
            <UnifiedSearchView
              project={currentProject || {
                id: 'global',
                name: 'System Workspace',
                key: 'SYS',
                description: 'Global Workspace',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'Active',
                documentsCount: 0,
                requirementsCount: 0,
                tasksCount: 0,
                conflictsCount: 0,
                memoriesCount: 0,
                knowledgeEntitiesCount: 0,
              }}
              documents={store.documents}
              requirements={store.requirements}
              conflicts={store.conflicts}
              tasks={store.tasks}
              knowledgeEntities={store.knowledgeEntities}
              memories={store.memories}
              onNavigateSection={store.setActiveSection}
            />
          )}

          {store.activeSection === 'settings' && (
            currentProject ? (
              <SettingsView
                project={currentProject}
                onUpdateProject={store.updateProject}
                onDeleteProject={store.deleteProject}
              />
            ) : (
              <SettingsView
                project={{
                  id: 'global',
                  name: 'System Workspace',
                  key: 'SYS',
                  description: 'Global Workspace',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  status: 'Active',
                  documentsCount: 0,
                  requirementsCount: 0,
                  tasksCount: 0,
                  conflictsCount: 0,
                  memoriesCount: 0,
                  knowledgeEntitiesCount: 0,
                }}
                onUpdateProject={() => {}}
                onDeleteProject={() => {}}
              />
            )
          )}
        </main>

        {/* Right AI Context Inspector Panel */}
        <ContextInspector
          isOpen={store.isContextInspectorOpen}
          onClose={() => store.setIsContextInspectorOpen(false)}
          context={store.inspectorContext}
          reasoningSummary={store.inspectorReasoning}
          toolsUsed={store.inspectorTools}
        />
      </div>

      {/* Global Modals & Drawers */}
      <NotificationDrawer
        isOpen={store.isNotificationsOpen}
        onClose={() => store.setIsNotificationsOpen(false)}
        notifications={store.notifications}
        onMarkRead={(id) => {
          store.markNotificationRead(id);
        }}
        onNavigateSection={store.setActiveSection}
      />

      <AuthModal
        isOpen={store.isAuthModalOpen}
        onClose={() => store.setIsAuthModalOpen(false)}
        user={store.user}
        onUpdateUser={store.updateUser}
        onLogOut={async () => {
          store.setIsAuthModalOpen(false);
          await store.logout();
        }}
      />

      <CreateProjectModal
        isOpen={store.isCreateProjectModalOpen}
        onClose={() => store.setIsCreateProjectModalOpen(false)}
        onCreateProject={store.createProject}
      />
    </div>
  );
}