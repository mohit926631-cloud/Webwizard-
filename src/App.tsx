import React, { useState, useEffect } from 'react';
import { ViewMode, User, Project, Template, Toast, AuthMode, AIChatMessage, ProjectFiles } from './types';
import { apiService, setStoredToken, getStoredToken } from './services/api';
import { storage } from './services/storage';
import { TEMPLATES } from './services/templateData';
import { exportProjectAsZip } from './services/zipExport';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/Auth/AuthModal';

// Landing Page Components
import { HeroSection } from './components/Landing/HeroSection';
import { FeaturesSection } from './components/Landing/FeaturesSection';
import { TemplatesSection } from './components/Landing/TemplatesSection';
import { PricingSection } from './components/Landing/PricingSection';
import { FAQSection } from './components/Landing/FAQSection';

// Dashboard Components
import { DashboardSidebar } from './components/Dashboard/DashboardSidebar';
import { ProjectsGrid } from './components/Dashboard/ProjectsGrid';
import { NewProjectModal } from './components/Dashboard/NewProjectModal';

// Editor Components
import { GenerationProgress } from './components/Editor/GenerationProgress';
import { EditorLayout } from './components/Editor/EditorLayout';
import { LiveBuildRunner } from './components/BuildRunner/LiveBuildRunner';

// Settings & Billing Views
import { SettingsView } from './components/Settings/SettingsView';
import { AIModelsView } from './components/Settings/AIModelsView';
import { BillingView } from './components/Billing/BillingView';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Modals and UI overlays
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);

  // AI Chat History for active project
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);

  // Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const newToast: Toast = { id: `toast_${Date.now()}_${Math.random()}`, type, message, title };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // FETCH SESSION & PROJECTS FROM SERVER
  const loadUserData = async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const { user: serverUser } = await apiService.getMe();
      setUser(serverUser);
      storage.saveUser(serverUser);

      const serverProjects = await apiService.getProjects();
      setProjects(serverProjects);
    } catch (err: any) {
      console.warn('Session check failed or expired token:', err);
      setStoredToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // AUTH ACTIONS
  const handleSignOut = async () => {
    await apiService.logout();
    setUser(null);
    setProjects([]);
    setCurrentView('landing');
    addToast('info', 'You have been signed out.');
  };

  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // PROJECT CREATION & GENERATION FLOW
  const handleStartBuilding = (prompt?: string) => {
    if (!user) {
      addToast('info', 'Please sign in or create an account to start building websites.');
      handleOpenAuth('signup');
      return;
    }
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setNewProjectModalOpen(true);
  };

  const handleTriggerGenerate = (prompt: string) => {
    if (!user) {
      handleOpenAuth('signup');
      return;
    }
    setNewProjectModalOpen(false);
    setInitialPrompt(prompt);
    setGenerating(true);
  };

  const handleCompleteGeneration = (project: Project) => {
    const updatedProjects = [project, ...projects.filter((p) => p.id !== project.id)];
    setProjects(updatedProjects);
    setActiveProject(project);

    // Initialize Chat
    setChatMessages([
      {
        id: 'msg_1',
        role: 'assistant',
        content: `Website generated successfully from prompt: "${initialPrompt}". What changes would you like to make next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileChangesSummary: 'Generated index.html, style.css & script.js',
      },
    ]);

    loadUserData();
    addToast('success', 'Your website has been generated by VERVOX AI!', 'Website Generated');
  };

  // USE STARTER TEMPLATE
  const handleUseTemplate = async (template: Template) => {
    if (!user) {
      handleOpenAuth('signup');
      return;
    }

    try {
      const saved = await apiService.saveProject({
        name: `${template.name} Site`,
        description: template.description,
        category: template.category,
        files: template.files,
        thumbnailGradient: template.previewGradient,
      });

      setProjects([saved, ...projects]);
      setActiveProject(saved);

      setChatMessages([
        {
          id: 'msg_1',
          role: 'assistant',
          content: `Loaded ${template.name} template! You can now customize colors, text, or add new components with AI chat.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setCurrentView('editor');
      addToast('success', `Created project from ${template.name} template.`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed creating project from template.');
    }
  };

  // OPEN EXISTING PROJECT
  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setChatMessages([
      {
        id: 'msg_init',
        role: 'assistant',
        content: `Loaded project "${project.name}". Ask VERVOX AI to make any edits!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCurrentView('editor');
  };

  // RENAME PROJECT
  const handleRenameProject = async (project: Project, newName: string) => {
    try {
      const updated = await apiService.saveProject({
        ...project,
        name: newName,
      });

      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (activeProject?.id === updated.id) {
        setActiveProject(updated);
      }
      addToast('success', `Renamed project to "${newName}".`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed renaming project.');
    }
  };

  // DUPLICATE PROJECT
  const handleDuplicateProject = async (projectId: string) => {
    try {
      const dup = await apiService.duplicateProject(projectId);
      setProjects([dup, ...projects]);
      addToast('success', `Duplicated project "${dup.name}".`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed duplicating project.');
    }
  };

  // DELETE PROJECT
  const handleDeleteProject = async (projectId: string) => {
    try {
      await apiService.deleteProjectById(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      addToast('info', 'Project deleted.');
    } catch (err: any) {
      addToast('error', err.message || 'Failed deleting project.');
    }
  };

  // DOWNLOAD ZIP EXPORT
  const handleDownloadZip = async (projectToExport?: Project) => {
    const proj = projectToExport || activeProject;
    if (!proj) return;

    addToast('info', `Compressing ${proj.name} into ZIP archive...`);
    try {
      await exportProjectAsZip(proj);
      addToast('success', `Downloaded ${proj.name}.zip successfully!`);
    } catch {
      addToast('error', 'Failed to generate ZIP archive.');
    }
  };

  // AI EDIT IN EDITOR
  const handleSendAIPrompt = async (prompt: string) => {
    if (!activeProject || !user) return;

    const userMsg: AIChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setAiEditLoading(true);

    try {
      const result = await apiService.editWebsite(
        prompt,
        activeProject.files,
        activeProject.id,
        activeProject.name
      );

      setUser(result.user);
      storage.saveUser(result.user);

      const updatedProject: Project = {
        ...activeProject,
        files: result.files,
        updatedAt: new Date().toISOString(),
      };

      setActiveProject(updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));

      const assistantMsg: AIChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: result.explanation || `I've updated the website files according to your instruction.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileChangesSummary: 'Updated index.html, style.css & script.js',
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
      addToast('success', 'Applied AI edits to project files.');
    } catch (err: any) {
      if (err.data?.error === 'INSUFFICIENT_CREDITS') {
        addToast('error', err.message || 'Insufficient credits.');
        setCurrentView('billing');
      } else {
        addToast('error', err.message || 'AI Edit failed.');
      }
    } finally {
      setAiEditLoading(false);
    }
  };

  // ZIP IMPORT PROJECT
  const handleImportProject = async (name: string, files: Record<string, string>) => {
    try {
      const normalizedFiles: ProjectFiles = {
        'index.html': files['index.html'] || '<!DOCTYPE html>\n<html>\n<head><title>Imported Site</title></head>\n<body>\n<h1>Imported Website</h1>\n</body>\n</html>',
        'style.css': files['style.css'] || '/* Imported CSS */\nbody { font-family: system-ui, sans-serif; padding: 2rem; }',
        'script.js': files['script.js'] || '// Imported JS\nconsole.log("Project loaded.");',
        ...files,
      };

      const newProj = await apiService.saveProject({
        name,
        description: 'Imported ZIP Project workspace',
        category: 'Imported',
        files: normalizedFiles,
        thumbnailGradient: 'from-emerald-600 to-teal-800',
      });
      setProjects([newProj, ...projects]);
      setActiveProject(newProj);
      setCurrentView('editor');
      addToast('success', `Created project "${name}" from imported ZIP!`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create project from ZIP.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* TOAST CONTAINER */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          storage.saveUser(u);
          loadUserData();
        }}
        onToast={addToast}
      />

      {/* NEW PROJECT MODAL */}
      <NewProjectModal
        isOpen={newProjectModalOpen}
        initialPrompt={initialPrompt}
        onClose={() => setNewProjectModalOpen(false)}
        onGenerate={handleTriggerGenerate}
        onExploreTemplates={() => {
          setCurrentView('templates');
        }}
      />

      {/* NETLIFY-STYLE LIVE BUILD RUNNER */}
      {generating && (
        <LiveBuildRunner
          prompt={initialPrompt}
          onComplete={handleCompleteGeneration}
          onCancel={() => {
            setGenerating(false);
            addToast('info', 'Website generation cancelled.');
          }}
          onEditInEditor={(project) => {
            setActiveProject(project);
            setGenerating(false);
            setCurrentView('editor');
          }}
          onGoToHistory={() => {
            setGenerating(false);
            setCurrentView('dashboard');
          }}
        />
      )}

      {/* VIEW CONDITIONALS */}
      {currentView === 'editor' && activeProject ? (
        <EditorLayout
          project={activeProject}
          messages={chatMessages}
          loading={aiEditLoading}
          onNavigate={setCurrentView}
          onUpdateFiles={(newFiles) => {
            const updated = { ...activeProject, files: newFiles, updatedAt: new Date().toISOString() };
            setActiveProject(updated);
            apiService.saveProject(updated).then(() => {
              setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            });
          }}
          onSaveProject={() => {
            if (activeProject) {
              apiService.saveProject(activeProject).then(() => {
                addToast('success', 'Project changes saved to server.');
              });
            }
          }}
          onDownloadZip={() => handleDownloadZip(activeProject)}
          onSendAIPrompt={handleSendAIPrompt}
          onRegenerateAI={() => {
            if (chatMessages.length > 1) {
              const lastUserMsg = [...chatMessages].reverse().find((m) => m.role === 'user');
              if (lastUserMsg) handleSendAIPrompt(lastUserMsg.content);
            }
          }}
          onUndoAI={() => {
            addToast('info', 'Reverted last AI edit.');
          }}
          onToast={addToast}
        />
      ) : (
        <>
          {/* TOP NAVBAR */}
          <Navbar
            currentView={currentView}
            onNavigate={setCurrentView}
            user={user}
            onSignOut={handleSignOut}
            onOpenAuth={handleOpenAuth}
          />

          {/* MAIN PAGE VIEW ROUTER */}
          <main className="flex-1">
            {currentView === 'landing' && (
              <>
                <HeroSection
                  onStartBuilding={handleStartBuilding}
                  onNavigate={setCurrentView}
                />
                <FeaturesSection />
                <TemplatesSection onUseTemplate={handleUseTemplate} />
                <PricingSection
                  onSelectPlan={(plan) => {
                    if (user) {
                      setCurrentView('billing');
                    } else {
                      handleOpenAuth('signup');
                    }
                  }}
                />
                <FAQSection />
              </>
            )}

            {currentView === 'dashboard' && (
              <div className="flex min-h-[calc(100vh-64px)]">
                <DashboardSidebar
                  currentView={currentView}
                  onNavigate={setCurrentView}
                  user={
                    user || {
                      id: 'guest',
                      name: 'Guest User',
                      email: 'guest@vervox.ai',
                      plan: 'free',
                      usage: {
                        monthlyCredits: 0,
                        maxMonthlyCredits: 200,
                        purchasedCredits: 0,
                        creditsUsed: 0,
                        lastCreditResetDate: new Date().toISOString(),
                        subscriptionStatus: 'none',
                        subscriptionRenewalDate: new Date().toISOString(),
                        generationsUsed: 0,
                        maxGenerations: 10,
                        projectsCount: 0,
                        maxProjects: 10,
                        storageMb: 0,
                        maxStorageMb: 50,
                      },
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                  }
                  onSignOut={handleSignOut}
                  onOpenNewProject={() => handleStartBuilding()}
                />
                <div className="flex-1 p-6 sm:p-10 bg-slate-950">
                  <ProjectsGrid
                    user={
                      user || {
                        id: 'guest',
                        name: 'Guest User',
                        email: 'guest@vervox.ai',
                        plan: 'free',
                        usage: {
                          monthlyCredits: 0,
                          maxMonthlyCredits: 200,
                          purchasedCredits: 0,
                          creditsUsed: 0,
                          lastCreditResetDate: new Date().toISOString(),
                          subscriptionStatus: 'none',
                          subscriptionRenewalDate: new Date().toISOString(),
                          generationsUsed: 0,
                          maxGenerations: 10,
                          projectsCount: projects.length,
                          maxProjects: 10,
                          storageMb: 0,
                          maxStorageMb: 50,
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      }
                    }
                    projects={projects}
                    onOpenProject={handleOpenProject}
                    onRenameProject={handleRenameProject}
                    onDuplicateProject={handleDuplicateProject}
                    onDeleteProject={handleDeleteProject}
                    onDownloadZip={handleDownloadZip}
                    onCreateNewProject={() => handleStartBuilding()}
                    onUpgrade={() => setCurrentView('billing')}
                    onImportProject={handleImportProject}
                    onToast={addToast}
                  />
                </div>
              </div>
            )}

            {currentView === 'templates' && (
              <TemplatesSection onUseTemplate={handleUseTemplate} />
            )}

            {currentView === 'pricing' && (
              <PricingSection
                onSelectPlan={() => {
                  if (user) {
                    setCurrentView('billing');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
              />
            )}

            {currentView === 'faq' && <FAQSection />}

            {currentView === 'settings' && user && (
              <SettingsView
                user={user}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  storage.saveUser(updated);
                }}
                onToast={addToast}
              />
            )}

            {currentView === 'models' && <AIModelsView />}

            {currentView === 'billing' && user && (
              <BillingView
                user={user}
                onUserUpdated={(updatedUser) => {
                  setUser(updatedUser);
                  storage.saveUser(updatedUser);
                }}
                onToast={addToast}
              />
            )}
          </main>

          {/* FOOTER */}
          <Footer onNavigate={setCurrentView} />
        </>
      )}
    </div>
  );
}

export default App;
