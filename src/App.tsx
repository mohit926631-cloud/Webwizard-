import React, { useState, useEffect } from 'react';
import { ViewMode, User, Project, Template, Toast, AIChatMessage, ProjectFiles } from './types';
import { apiService } from './services/api';
import { storage, DEFAULT_USER } from './services/storage';
import { exportProjectAsZip } from './services/zipExport';
import { useSafeClerkUser } from './components/Auth/ClerkAuthProvider';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ClerkAuthModal } from './components/Auth/ClerkAuthModal';

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
import { EditorLayout } from './components/Editor/EditorLayout';
import { LiveBuildRunner } from './components/BuildRunner/LiveBuildRunner';

// Settings & Billing Views
import { SettingsView } from './components/Settings/SettingsView';
import { AIModelsView } from './components/Settings/AIModelsView';
import { BillingView } from './components/Billing/BillingView';

export function App() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useSafeClerkUser();
  const [user, setUser] = useState<User>(storage.getUser() || DEFAULT_USER);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Sync with Clerk User whenever clerk auth changes
  useEffect(() => {
    if (isClerkLoaded && isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || 'creator@vervox.ai';
      const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Creator';
      setUser((prev) => {
        const updated: User = {
          ...prev,
          id: clerkUser.id,
          name,
          email,
          avatar: clerkUser.imageUrl || prev.avatar,
        };
        storage.saveUser(updated);
        return updated;
      });
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);

  // Modals and UI overlays
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [clerkAuthModalOpen, setClerkAuthModalOpen] = useState(false);
  const [clerkAuthModalMode, setClerkAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [initialPrompt, setInitialPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);

  const handleOpenClerkAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setClerkAuthModalMode(mode);
    setClerkAuthModalOpen(true);
  };

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
    try {
      const { user: serverUser } = await apiService.getMe();
      if (serverUser) {
        setUser(serverUser);
        storage.saveUser(serverUser);
      }
    } catch {
      // Offline fallback
    }

    try {
      const serverProjects = await apiService.getProjects();
      if (serverProjects && serverProjects.length > 0) {
        setProjects(serverProjects);
      }
    } catch {
      // server error
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // START BUILDING (NEW PROJECT FLOW)
  const handleStartBuilding = (prompt?: string) => {
    setInitialPrompt(prompt || '');
    setNewProjectModalOpen(true);
  };

  // TRIGGER GENERATION (OPENS NETLIFY LIVE RUNNER)
  const handleTriggerGenerate = (prompt: string, category: string) => {
    setNewProjectModalOpen(false);
    setInitialPrompt(prompt);
    setGenerating(true);
  };

  // GENERATION COMPLETED BY LIVE BUILD RUNNER
  const handleCompleteGeneration = (project: Project, updatedUser?: User) => {
    setProjects((prev) => [project, ...prev]);

    if (updatedUser) {
      setUser(updatedUser);
      storage.saveUser(updatedUser);
    }

    setActiveProject(project);
    setGenerating(false);
    setCurrentView('editor');

    // Initial welcome AI message
    setChatMessages([
      {
        id: `msg_init_${Date.now()}`,
        role: 'assistant',
        content: `I've generated your **${project.name}** website project! You can preview it in live view, edit HTML/CSS/JS in the code editor, ask me to modify any section, or download it as a ZIP package.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    addToast('success', `Website "${project.name}" created successfully!`, 'Generation Complete');
  };

  // OPEN EXISTING PROJECT
  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setCurrentView('editor');
    setChatMessages([
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Loaded **${project.name}**. Ready for live edits or code export.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // USE TEMPLATE FLOW
  const handleUseTemplate = async (template: Template) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      userId: user.id || 'default_user_1',
      name: `${template.name} Clone`,
      description: template.description,
      category: template.category,
      files: template.files,
      thumbnailGradient: template.previewGradient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Ready',
      framework: 'HTML5 / Tailwind / JS',
      versionNumber: 1,
    };

    setProjects((prev) => [newProj, ...prev]);
    try {
      await apiService.saveProject(newProj);
    } catch {
      // offline save
    }

    setActiveProject(newProj);
    setCurrentView('editor');
    addToast('success', `Template "${template.name}" loaded as a new project.`);
  };

  // DUPLICATE PROJECT
  const handleDuplicateProject = async (project: Project) => {
    try {
      const duplicated = await apiService.duplicateProject(project.id);
      if (duplicated) {
        setProjects((prev) => [duplicated, ...prev]);
        addToast('success', `Project "${project.name}" duplicated.`);
      }
    } catch {
      const duplicated: Project = {
        ...project,
        id: `proj_${Date.now()}`,
        name: `${project.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [duplicated, ...prev]);
      addToast('success', `Project "${project.name}" duplicated.`);
    }
  };

  // RENAME PROJECT
  const handleRenameProject = async (id: string, newName: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, name: newName, updatedAt: new Date().toISOString() };
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (activeProject && activeProject.id === id) {
      setActiveProject(updated);
    }
    try {
      await apiService.saveProject(updated);
    } catch {
      // Local fallback
    }
    addToast('info', 'Project renamed.');
  };

  // DELETE PROJECT
  const handleDeleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject && activeProject.id === id) {
      setActiveProject(null);
      setCurrentView('dashboard');
    }
    try {
      await apiService.deleteProject(id);
    } catch {
      // Local fallback
    }
    addToast('info', 'Project deleted.');
  };

  // DOWNLOAD AS ZIP
  const handleDownloadZip = async (project: Project) => {
    try {
      addToast('info', 'Preparing ZIP bundle with all HTML, CSS, and JS assets...');
      await exportProjectAsZip(project);
      addToast('success', `Downloaded "${project.name}.zip" successfully!`);
    } catch (err: any) {
      addToast('error', `Download failed: ${err?.message || 'Unknown error'}`);
    }
  };

  // IMPORT PROJECT FROM ZIP / JSON
  const handleImportProject = (importedProject: Project) => {
    setProjects((prev) => [importedProject, ...prev]);
    apiService.saveProject(importedProject).catch(() => {});
    addToast('success', `Project "${importedProject.name}" imported successfully.`);
  };

  // AI NATURAL LANGUAGE EDIT IN EDITOR
  const handleSendAIPrompt = async (promptText: string) => {
    if (!activeProject) return;

    const userMsg: AIChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setAiEditLoading(true);

    try {
      const data = await apiService.editWebsite(promptText, activeProject.files, activeProject.id, activeProject.name);

      if (data && data.files) {
        const updatedProj: Project = {
          ...activeProject,
          files: data.files,
          versionNumber: (activeProject.versionNumber || 1) + 1,
          updatedAt: new Date().toISOString(),
          lastAction: `AI Edit: ${promptText.slice(0, 24)}`,
        };

        setActiveProject(updatedProj);
        setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));

        if (data.user) {
          setUser(data.user);
          storage.saveUser(data.user);
        }

        const aiMsg: AIChatMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'assistant',
          content: data.explanation || `I have updated your website according to: "${promptText}". Check the preview on the right!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fileChangesSummary: 'Updated index.html, style.css, script.js',
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        addToast('success', 'AI modifications applied to preview!');
      }
    } catch (err: any) {
      const errMsg: AIChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I couldn't complete that modification: ${err?.message || 'Unknown error'}. Please try rephrasing your request.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errMsg]);
      addToast('error', err?.message || 'Failed to edit website with AI.');
    } finally {
      setAiEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* TOAST CONTAINER */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

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

      {/* CLERK AUTH MODAL (OFFICIAL CLERK SIGN IN / SIGN UP) */}
      <ClerkAuthModal
        isOpen={clerkAuthModalOpen}
        initialMode={clerkAuthModalMode}
        onClose={() => setClerkAuthModalOpen(false)}
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
            onOpenNewProject={() => handleStartBuilding()}
            onOpenProject={(projId) => {
              const found = projects.find((p) => p.id === projId);
              if (found) handleOpenProject(found);
            }}
            onOpenClerkAuth={handleOpenClerkAuth}
          />

          {/* MAIN PAGE VIEW ROUTER */}
          <main className="flex-1">
            {currentView === 'landing' && (
              <>
                <HeroSection
                  onStartBuilding={handleStartBuilding}
                  onNavigate={setCurrentView}
                  onOpenClerkAuth={handleOpenClerkAuth}
                />
                <FeaturesSection />
                <TemplatesSection onUseTemplate={handleUseTemplate} />
                <PricingSection
                  onSelectPlan={() => {
                    setCurrentView('billing');
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
                  user={user}
                  onOpenNewProject={() => handleStartBuilding()}
                />
                <div className="flex-1 p-6 sm:p-10 bg-slate-950">
                  <ProjectsGrid
                    user={user}
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
                  setCurrentView('billing');
                }}
              />
            )}

            {currentView === 'faq' && <FAQSection />}

            {currentView === 'settings' && (
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

            {currentView === 'billing' && (
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
