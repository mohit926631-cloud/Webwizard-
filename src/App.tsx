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
        };
        storage.saveUser(updated);
        return updated;
      });
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);


  // Modals and UI overlays
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
    try {
      const { user: serverUser } = await apiService.getMe();
      if (serverUser) {
        setUser(serverUser);
        storage.saveUser(serverUser);
      }

      const serverProjects = await apiService.getProjects();
      if (Array.isArray(serverProjects)) {
        setProjects(serverProjects);
      }
    } catch (err: any) {
      console.warn('Session load info:', err);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // PROJECT CREATION & GENERATION FLOW
  const handleStartBuilding = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setNewProjectModalOpen(true);
  };

  const handleTriggerGenerate = (prompt: string) => {
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
            onOpenNewProject={() => handleStartBuilding()}
            onOpenProject={(projId) => {
              const found = projects.find((p) => p.id === projId);
              if (found) handleOpenProject(found);
            }}
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
