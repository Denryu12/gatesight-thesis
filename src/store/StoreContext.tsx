import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type {
  AppState,
  User,
  Vehicle,
  Application,
  UnknownVehicle,
  EventLogEntry,
  AuditLogEntry,
  CameraConfig,
  GatePassRecord,
  WeatherCondition,
  SessionInfo,
  LiveVehicleDetection,
  ApplicationStatus,
  GatePassStatus,
  UnknownResolution,
  ContactRecord,
  MovementRecord,
  ConfirmedObservation,
} from '../types';
import {
  seedUsers,
  seedVehicles,
  seedApplications,
  seedUnknownVehicles,
  seedEventLogs,
  seedAuditLogs,
  seedCameras,
  seedGatePasses,
} from '../data/seed';

const STORAGE_KEY = 'gatesight-state-v1';

function createInitialState(): AppState {
  return {
    users: seedUsers,
    vehicles: seedVehicles,
    applications: seedApplications,
    unknownVehicles: seedUnknownVehicles,
    eventLogs: seedEventLogs,
    auditLogs: seedAuditLogs,
    cameras: seedCameras,
    gatePasses: seedGatePasses,
    currentWeather: 'NORMAL',
    guardSession: null,
    adminSession: null,
    settings: {
      unknownVerificationMode: 'ADMIN_ONLY',
      currentAcademicYear: '2026',
      gatePassExpiration: 'End of Year',
      notificationPrefs: { emailAlerts: true, smsAlerts: false, unknownVehicleAlerts: true },
    },
    nextVehicleSeq: 42,
    nextUnknownSeq: 32,
    nextApplicationSeq: 63,
    liveVehicles: [
      {
        id: 'LV-1',
        vehicleId: 'V-014',
        label: 'V-014',
        status: 'VERIFIED',
        gatePassStatus: 'VALID',
        boxColor: '#22c55e',
        x: 20,
        y: 35,
        width: 28,
        height: 38,
        moving: true,
      },
      {
        id: 'LV-2',
        vehicleId: 'UNKNOWN-027',
        label: 'UNKNOWN-027',
        status: 'REQUIRES_VERIFICATION',
        gatePassStatus: 'NOT_ISSUED',
        boxColor: '#f59e0b',
        x: 55,
        y: 30,
        width: 24,
        height: 34,
        moving: true,
      },
    ],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch {
    // ignore
  }
  return createInitialState();
}

interface StoreContextValue {
  state: AppState;
  login: (username: string, password: string, device: 'GUARD_PHONE' | 'ADMIN_DESKTOP') => User | null;
  logout: (device: 'GUARD_PHONE' | 'ADMIN_DESKTOP') => void;
  resetDemo: () => void;
  setWeather: (w: WeatherCondition) => void;
  setCameraStatus: (cameraId: string, status: 'ONLINE' | 'OFFLINE') => void;
  addAuditLog: (who: string, what: string, target: string, resultingStatus?: string, reason?: string) => void;
  addEventLog: (entry: Omit<EventLogEntry, 'id'>) => void;
  // Application actions
  createApplication: (by: string, data: Partial<Application>) => string;
  updateApplication: (id: string, updates: Partial<Application>, auditWho?: string, auditWhat?: string) => void;
  submitApplication: (id: string, by: string) => void;
  approveApplication: (id: string, by: string) => void;
  rejectApplication: (id: string, by: string, reason?: string) => void;
  issueSticker: (applicationId: string, stickerNo: string, by: string) => void;
  recordContact: (applicationId: string, contact: ContactRecord, by: string) => void;
  // Vehicle actions
  registerVehicle: (data: Partial<Vehicle>) => string;
  addMovementRecord: (vehicleId: string, record: Omit<MovementRecord, 'id'>) => void;
  addConfirmedObservation: (vehicleId: string, obs: Omit<ConfirmedObservation, 'id'>) => void;
  // Unknown vehicle actions
  resolveUnknownLinked: (unknownId: string, vehicleId: string, by: string) => void;
  resolveUnknownUnregistered: (unknownId: string, by: string) => void;
  // Settings
  updateSettings: (updates: Partial<AppState['settings']>) => void;
  updateCamera: (id: string, updates: Partial<CameraConfig>) => void;
  // Live monitoring
  setLiveVehicles: (vehicles: LiveVehicleDetection[]) => void;
  // Scenario runner
  runScenario: (scenarioId: string) => void;
}



const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const addAuditLog = useCallback((who: string, what: string, target: string, resultingStatus?: string, reason?: string) => {
    setState((prev) => ({
      ...prev,
      auditLogs: [
        {
          id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
          who,
          what,
          when: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
          target,
          resultingStatus,
          reason,
        },
        ...prev.auditLogs,
      ],
    }));
  }, []);

  const addEventLog = useCallback((entry: Omit<EventLogEntry, 'id'>) => {
    setState((prev) => ({
      ...prev,
      eventLogs: [
        { id: `E-${prev.eventLogs.length + 1}-${Date.now()}`, ...entry },
        ...prev.eventLogs,
      ],
    }));
  }, []);

  const login = useCallback((username: string, password: string, device: 'GUARD_PHONE' | 'ADMIN_DESKTOP') => {
    let user: User | null = null;
    setState((prev) => {
      user = prev.users.find((u) => u.username === username && u.password === password && u.active) || null;
      if (!user) return prev;
      const session: SessionInfo = {
        userId: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        loginTime: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        device,
      };
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: user.username,
        what: 'Login',
        when: session.loginTime,
        target: device === 'GUARD_PHONE' ? 'Guard Phone' : 'Admin Desktop',
        resultingStatus: 'Session Active',
      };
      return {
        ...prev,
        guardSession: device === 'GUARD_PHONE' ? session : prev.guardSession,
        adminSession: device === 'ADMIN_DESKTOP' ? session : prev.adminSession,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
    return user;
  }, []);

  const logout = useCallback((device: 'GUARD_PHONE' | 'ADMIN_DESKTOP') => {
    setState((prev) => {
      const session = device === 'GUARD_PHONE' ? prev.guardSession : prev.adminSession;
      if (!session) return prev;
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: session.username,
        what: 'Logout',
        when: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        target: device === 'GUARD_PHONE' ? 'Guard Phone' : 'Admin Desktop',
        resultingStatus: 'Session Ended',
      };
      return {
        ...prev,
        guardSession: device === 'GUARD_PHONE' ? null : prev.guardSession,
        adminSession: device === 'ADMIN_DESKTOP' ? null : prev.adminSession,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const setWeather = useCallback((w: WeatherCondition) => {
    setState((prev) => ({ ...prev, currentWeather: w }));
  }, []);

  const setCameraStatus = useCallback((cameraId: string, status: 'ONLINE' | 'OFFLINE') => {
    setState((prev) => ({
      ...prev,
      cameras: prev.cameras.map((c) => (c.id === cameraId ? { ...c, status } : c)),
    }));
  }, []);

  const createApplication = useCallback((by: string, data: Partial<Application>) => {
    let newId = '';
    setState((prev) => {
      newId = `APP-2026-${String(prev.nextApplicationSeq).padStart(4, '0')}`;
      const app: Application = {
        id: newId,
        applicantName: data.applicantName || '',
        contactInfo: data.contactInfo || '',
        applicantType: data.applicantType || 'Student',
        program: data.program,
        department: data.department,
        year: data.year,
        section: data.section,
        position: data.position,
        status: 'DRAFT',
        requirementsComplete: false,
        attachmentsAvailable: false,
        history: [
          { action: 'Application Created', by, timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) },
        ],
      };
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: 'Application Created',
        when: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        target: newId,
        resultingStatus: 'DRAFT',
      };
      return {
        ...prev,
        applications: [app, ...prev.applications],
        nextApplicationSeq: prev.nextApplicationSeq + 1,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
    return newId;
  }, []);

  const updateApplication = useCallback((id: string, updates: Partial<Application>, auditWho?: string, auditWhat?: string) => {
    setState((prev) => {
      const audit = auditWho && auditWhat
        ? [{
            id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
            who: auditWho,
            what: auditWhat,
            when: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
            target: id,
            resultingStatus: updates.status,
          }]
        : [];
      return {
        ...prev,
        applications: prev.applications.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        auditLogs: [...audit, ...prev.auditLogs],
      };
    });
  }, []);

  const submitApplication = useCallback((id: string, by: string) => {
    setState((prev) => {
      const app = prev.applications.find((a) => a.id === id);
      if (!app) return prev;
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
      const updatedApp = {
        ...app,
        status: 'READY_FOR_ADMIN_REVIEW' as ApplicationStatus,
        submittedBy: by,
        submittedAt: timestamp,
        history: [...app.history, { action: 'Submitted for Review', by, timestamp }],
      };
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: 'Application Submitted',
        when: timestamp,
        target: id,
        resultingStatus: 'READY_FOR_ADMIN_REVIEW',
      };
      return {
        ...prev,
        applications: prev.applications.map((a) => (a.id === id ? updatedApp : a)),
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const approveApplication = useCallback((id: string, by: string) => {
    setState((prev) => {
      const app = prev.applications.find((a) => a.id === id);
      if (!app) return prev;
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const updatedApp: Application = {
        ...app,
        status: 'APPROVED',
        reviewedBy: by,
        reviewedAt: timestamp,
        history: [...app.history, { action: 'Application Approved', by, timestamp }],
      };
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: 'Application Approved',
        when: timestamp,
        target: id,
        resultingStatus: 'APPROVED',
      };
      // Update vehicle gate pass status to PENDING if vehicle exists
      const vehicles = prev.vehicles.map((v) => {
        if (v.applicationId === id || app.vehicleId === v.id) {
          return { ...v, gatePassStatus: 'PENDING' as GatePassStatus, applicationId: id };
        }
        return v;
      });
      return {
        ...prev,
        applications: prev.applications.map((a) => (a.id === id ? updatedApp : a)),
        vehicles,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const rejectApplication = useCallback((id: string, by: string, reason?: string) => {
    setState((prev) => {
      const app = prev.applications.find((a) => a.id === id);
      if (!app) return prev;
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const updatedApp: Application = {
        ...app,
        status: 'REJECTED',
        reviewedBy: by,
        reviewedAt: timestamp,
        rejectionReason: reason,
        history: [...app.history, { action: 'Application Rejected', by, timestamp, note: reason }],
      };
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: 'Application Rejected',
        when: timestamp,
        target: id,
        resultingStatus: 'REJECTED',
        reason,
      };
      return {
        ...prev,
        applications: prev.applications.map((a) => (a.id === id ? updatedApp : a)),
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const issueSticker = useCallback((applicationId: string, stickerNo: string, by: string) => {
    setState((prev) => {
      const app = prev.applications.find((a) => a.id === applicationId);
      if (!app) return prev;
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const updatedApp: Application = {
        ...app,
        stickerNo,
        issuedBy: by,
        issuedDate: timestamp,
        history: [...app.history, { action: 'Sticker Issued', by, timestamp, note: stickerNo }],
      };
      const vehicles = prev.vehicles.map((v) => {
        if (v.applicationId === applicationId || app.vehicleId === v.id) {
          return { ...v, stickerNo, gatePassStatus: 'VALID' as GatePassStatus, validUntil: `Dec 31, ${prev.settings.currentAcademicYear}`, issuedBy: by, issuedDate: timestamp, applicationId };
        }
        return v;
      });
      const gatePass: GatePassRecord = {
        stickerNo,
        vehicleId: app.vehicleId || '',
        applicationId,
        status: 'VALID',
        validUntil: `Dec 31, ${prev.settings.currentAcademicYear}`,
        issuedBy: by,
        issuedDate: timestamp,
      };
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: 'Sticker Issued',
        when: timestamp,
        target: stickerNo,
        resultingStatus: 'VALID',
      };
      return {
        ...prev,
        applications: prev.applications.map((a) => (a.id === applicationId ? updatedApp : a)),
        vehicles,
        gatePasses: [...prev.gatePasses, gatePass],
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const recordContact = useCallback((applicationId: string, contact: ContactRecord, by: string) => {
    setState((prev) => {
      const app = prev.applications.find((a) => a.id === applicationId);
      if (!app) return prev;
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const updatedApp: Application = {
        ...app,
        contactRecord: contact,
        history: [...app.history, { action: 'Applicant Contacted', by, timestamp, note: contact.notes }],
      };
      const vehicles = prev.vehicles.map((v) => {
        if (v.applicationId === applicationId || app.vehicleId === v.id) {
          return { ...v, contactRecord: contact };
        }
        return v;
      });
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: 'Applicant Contacted',
        when: timestamp,
        target: app.vehicleId || applicationId,
        resultingStatus: contact.status,
      };
      return {
        ...prev,
        applications: prev.applications.map((a) => (a.id === applicationId ? updatedApp : a)),
        vehicles,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const registerVehicle = useCallback((data: Partial<Vehicle>) => {
    let newId = '';
    setState((prev) => {
      newId = `V-${String(prev.nextVehicleSeq).padStart(3, '0')}`;
      const vehicle: Vehicle = {
        id: newId,
        owner: data.owner || '',
        applicantType: data.applicantType || 'Student',
        program: data.program,
        department: data.department,
        year: data.year,
        section: data.section,
        position: data.position,
        vehicleType: data.vehicleType || 'Sedan',
        makeModel: data.makeModel || '',
        color: data.color || '',
        plate: data.plate || '',
        gatePassStatus: 'NOT_ISSUED',
        validUntil: 'Pending',
        contactInfo: data.contactInfo,
        contactRecord: { status: 'NOT_CONTACTED' },
        confirmedObservations: [
          { id: `OBS-${Date.now()}`, source: 'Registration Scan', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), lighting: 'Daylight', viewingAngle: 'Front', confidence: 'High' },
        ],
        movementHistory: [],
        profileInconsistency: null,
      };
      return {
        ...prev,
        vehicles: [...prev.vehicles, vehicle],
        nextVehicleSeq: prev.nextVehicleSeq + 1,
      };
    });
    return newId;
  }, []);

  const addMovementRecord = useCallback((vehicleId: string, record: Omit<MovementRecord, 'id'>) => {
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, movementHistory: [...v.movementHistory, { ...record, id: `M-${v.movementHistory.length + 1}-${Date.now()}` }] }
          : v
      ),
    }));
  }, []);

  const addConfirmedObservation = useCallback((vehicleId: string, obs: Omit<ConfirmedObservation, 'id'>) => {
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, confirmedObservations: [...v.confirmedObservations, { ...obs, id: `OBS-${v.confirmedObservations.length + 1}-${Date.now()}` }] }
          : v
      ),
    }));
  }, []);

  const resolveUnknownLinked = useCallback((unknownId: string, vehicleId: string, by: string) => {
    setState((prev) => {
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: `${unknownId} linked to ${vehicleId}`,
        when: timestamp,
        target: unknownId,
        resultingStatus: 'RESOLVED — LINKED',
      };
      return {
        ...prev,
        unknownVehicles: prev.unknownVehicles.map((u) =>
          u.id === unknownId
            ? { ...u, status: 'RESOLVED_LINKED' as UnknownResolution, resolvedTo: vehicleId, resolvedBy: by, resolvedAt: timestamp }
            : u
        ),
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const resolveUnknownUnregistered = useCallback((unknownId: string, by: string) => {
    setState((prev) => {
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const audit = {
        id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
        who: by,
        what: `${unknownId} marked Unregistered`,
        when: timestamp,
        target: unknownId,
        resultingStatus: 'RESOLVED — UNREGISTERED',
      };
      return {
        ...prev,
        unknownVehicles: prev.unknownVehicles.map((u) =>
          u.id === unknownId
            ? { ...u, status: 'RESOLVED_UNREGISTERED' as UnknownResolution, resolvedBy: by, resolvedAt: timestamp }
            : u
        ),
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<AppState['settings']>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, []);

  const updateCamera = useCallback((id: string, updates: Partial<CameraConfig>) => {
    setState((prev) => ({
      ...prev,
      cameras: prev.cameras.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const setLiveVehicles = useCallback((vehicles: LiveVehicleDetection[]) => {
    setState((prev) => ({ ...prev, liveVehicles: vehicles }));
  }, []);

  const runScenario = useCallback((scenarioId: string) => {
    setState((prev) => {
      let next = { ...prev };
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const timestamp = now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

      switch (scenarioId) {
        case 'NORMAL': {
          next.currentWeather = 'NORMAL';
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'V-014', label: 'V-014', status: 'VERIFIED', gatePassStatus: 'VALID', boxColor: '#22c55e', x: 20, y: 35, width: 28, height: 38, moving: true },
          ];
          break;
        }
        case 'VALID_ENTRY': {
          next.currentWeather = 'NORMAL';
          const v = prev.vehicles.find((v) => v.id === 'V-014');
          if (v) {
            const event: EventLogEntry = {
              id: `E-${prev.eventLogs.length + 1}-${Date.now()}`,
              vehicleId: 'V-014',
              date: dateStr,
              time: timeStr,
              gate: 'Gate 1',
              camera: 'Gate 1-A',
              direction: 'ENTRY',
              recognitionStatus: 'VERIFIED',
              gatePassStatus: 'VALID',
              detectedPlate: 'ABC 1234',
              evidenceRef: `EV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-SC`,
            };
            next.eventLogs = [event, ...prev.eventLogs];
            next.vehicles = prev.vehicles.map((veh) =>
              veh.id === 'V-014'
                ? { ...veh, movementHistory: [...veh.movementHistory, { id: `M-${veh.movementHistory.length + 1}-${Date.now()}`, date: dateStr, time: timeStr, gate: 'Gate 1', camera: 'Gate 1-A', direction: 'ENTRY', recognitionStatus: 'VERIFIED' }] }
                : veh
            );
          }
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'V-014', label: 'V-014', status: 'VERIFIED', gatePassStatus: 'VALID', boxColor: '#22c55e', x: 20, y: 35, width: 28, height: 38, moving: true },
          ];
          break;
        }
        case 'PENDING_PASS': {
          next.currentWeather = 'NORMAL';
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'V-021', label: 'V-021', status: 'PENDING', gatePassStatus: 'PENDING', boxColor: '#f59e0b', x: 25, y: 35, width: 22, height: 36, moving: true },
          ];
          break;
        }
        case 'EXPIRED_PASS': {
          next.currentWeather = 'NORMAL';
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'V-032', label: 'V-032', status: 'EXPIRED', gatePassStatus: 'EXPIRED', boxColor: '#ef4444', x: 25, y: 35, width: 30, height: 40, moving: true },
          ];
          break;
        }
        case 'UNKNOWN_VEHICLE': {
          next.currentWeather = 'NORMAL';
          const unknownId = `UNKNOWN-${prev.nextUnknownSeq}`;
          const newUnknown: UnknownVehicle = {
            id: unknownId,
            gate: 'Gate 1',
            camera: 'Gate 1-A',
            direction: 'ENTRY',
            date: dateStr,
            time: timeStr,
            detectedPlate: 'XYZ 7788',
            status: 'NEW',
          };
          next.unknownVehicles = [newUnknown, ...prev.unknownVehicles];
          next.nextUnknownSeq = prev.nextUnknownSeq + 1;
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: unknownId, label: unknownId, status: 'REQUIRES_VERIFICATION', gatePassStatus: 'NOT_ISSUED', boxColor: '#f59e0b', x: 30, y: 35, width: 25, height: 36, moving: true },
          ];
          const event: EventLogEntry = {
            id: `E-${prev.eventLogs.length + 1}-${Date.now()}`,
            vehicleId: unknownId,
            date: dateStr,
            time: timeStr,
            gate: 'Gate 1',
            camera: 'Gate 1-A',
            direction: 'ENTRY',
            recognitionStatus: 'REQUIRES_VERIFICATION',
            gatePassStatus: 'NOT_ISSUED',
            detectedPlate: 'XYZ 7788',
            evidenceRef: `EV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-SC`,
          };
          next.eventLogs = [event, ...prev.eventLogs];
          break;
        }
        case 'UNKNOWN_RESOLVED': {
          const unk = prev.unknownVehicles.find((u) => u.id === 'UNKNOWN-027');
          if (unk && unk.status === 'NEW') {
            next.unknownVehicles = prev.unknownVehicles.map((u) =>
              u.id === 'UNKNOWN-027'
                ? { ...u, status: 'RESOLVED_LINKED' as UnknownResolution, resolvedTo: 'V-014', resolvedBy: 'Admin01', resolvedAt: timestamp }
                : u
            );
            const audit = {
              id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
              who: 'Admin01',
              what: 'UNKNOWN-027 linked to V-014',
              when: timestamp,
              target: 'UNKNOWN-027',
              resultingStatus: 'RESOLVED — LINKED',
            };
            next.auditLogs = [audit, ...prev.auditLogs];
          }
          break;
        }
        case 'UNKNOWN_NOT_REGISTERED': {
          const unk = prev.unknownVehicles.find((u) => u.id === 'UNKNOWN-031');
          if (unk && unk.status === 'NEW') {
            next.unknownVehicles = prev.unknownVehicles.map((u) =>
              u.id === 'UNKNOWN-031'
                ? { ...u, status: 'RESOLVED_UNREGISTERED' as UnknownResolution, resolvedBy: 'Admin01', resolvedAt: timestamp }
                : u
            );
            const audit = {
              id: `A-${prev.auditLogs.length + 1}-${Date.now()}`,
              who: 'Admin01',
              what: 'UNKNOWN-031 marked Unregistered',
              when: timestamp,
              target: 'UNKNOWN-031',
              resultingStatus: 'RESOLVED — UNREGISTERED',
            };
            next.auditLogs = [audit, ...prev.auditLogs];
          }
          break;
        }
        case 'HEAVY_RAIN': {
          next.currentWeather = 'HEAVY_RAIN';
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'UNKNOWN-028', label: 'UNKNOWN-028', status: 'REQUIRES_VERIFICATION', gatePassStatus: 'NOT_ISSUED', boxColor: '#f59e0b', x: 30, y: 35, width: 25, height: 36, moving: true },
          ];
          break;
        }
        case 'FOG': {
          next.currentWeather = 'FOG';
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'V-014', label: 'V-014', status: 'VERIFIED', gatePassStatus: 'VALID', boxColor: '#22c55e', x: 20, y: 35, width: 28, height: 38, moving: true },
          ];
          break;
        }
        case 'NIGHT_FOG': {
          next.currentWeather = 'NIGHT_FOG';
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'UNKNOWN-029', label: 'UNKNOWN-029', status: 'REQUIRES_VERIFICATION', gatePassStatus: 'NOT_ISSUED', boxColor: '#f59e0b', x: 30, y: 35, width: 25, height: 36, moving: true },
          ];
          break;
        }
        case 'RECOGNITION_FAILURE': {
          next.currentWeather = 'RECOGNITION_FAILURE';
          const unknownId = `UNKNOWN-${prev.nextUnknownSeq}`;
          next.unknownVehicles = [
            { id: unknownId, gate: 'Gate 2', camera: 'Gate 2-A', direction: 'ENTRY', date: dateStr, time: timeStr, status: 'NEW' },
            ...prev.unknownVehicles,
          ];
          next.nextUnknownSeq = prev.nextUnknownSeq + 1;
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: unknownId, label: unknownId, status: 'REQUIRES_VERIFICATION', gatePassStatus: 'NOT_ISSUED', boxColor: '#ef4444', x: 30, y: 35, width: 25, height: 36, moving: false },
          ];
          break;
        }
        case 'PROFILE_INCONSISTENCY': {
          next.currentWeather = 'NORMAL';
          next.vehicles = prev.vehicles.map((v) =>
            v.id === 'V-014'
              ? { ...v, profileInconsistency: { observedModel: 'Toyota Corolla', date: dateStr } }
              : v
          );
          next.liveVehicles = [
            { id: 'LV-1', vehicleId: 'V-014', label: 'V-014', status: 'VERIFIED', gatePassStatus: 'VALID', boxColor: '#3b82f6', x: 20, y: 35, width: 28, height: 38, moving: true, observedModel: 'Toyota Corolla', profileInconsistency: true },
          ];
          break;
        }
        case 'CAMERA_OFFLINE': {
          next.cameras = prev.cameras.map((c) => (c.id === 'CAM-1A' ? { ...c, status: 'OFFLINE' as const } : c));
          next.liveVehicles = [];
          break;
        }
        default:
          break;
      }
      return next;
    });
  }, []);

  const value: StoreContextValue = {
    state,
    login,
    logout,
    resetDemo,
    setWeather,
    setCameraStatus,
    addAuditLog,
    addEventLog,
    createApplication,
    updateApplication,
    submitApplication,
    approveApplication,
    rejectApplication,
    issueSticker,
    recordContact,
    registerVehicle,
    addMovementRecord,
    addConfirmedObservation,
    resolveUnknownLinked,
    resolveUnknownUnregistered,
    updateSettings,
    updateCamera,
    setLiveVehicles,
    runScenario,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
