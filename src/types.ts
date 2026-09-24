export type Role = 'ADMINISTRATOR' | 'GUARD';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
  active: boolean;
}

export type GatePassStatus = 'NOT_ISSUED' | 'PENDING' | 'VALID' | 'EXPIRED' | 'REJECTED' | 'SUSPENDED';
export type ApplicationStatus =
  | 'DRAFT'
  | 'REQUIREMENTS_PENDING'
  | 'REQUIREMENTS_COMPLETE'
  | 'VEHICLE_SCAN_PENDING'
  | 'READY_FOR_ADMIN_REVIEW'
  | 'ADMIN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';
export type RecognitionStatus = 'VERIFIED' | 'UNKNOWN' | 'REQUIRES_VERIFICATION' | 'PENDING' | 'EXPIRED';
export type UnknownResolution = 'NEW' | 'UNDER_REVIEW' | 'RESOLVED_LINKED' | 'RESOLVED_UNREGISTERED' | 'UNRESOLVED';
export type WeatherCondition = 'NORMAL' | 'RAIN' | 'HEAVY_RAIN' | 'FOG' | 'NIGHT_FOG' | 'NIGHT' | 'RECOGNITION_FAILURE';
export type CameraStatus = 'ONLINE' | 'OFFLINE';
export type CameraPosition = 'MAIN_FRONT' | 'ELEVATED_TOP_DOWN';
export type Direction = 'ENTRY' | 'EXIT';
export type VehicleType = 'Motorcycle' | 'Sedan' | 'SUV' | 'Pickup' | 'Van' | 'Truck' | 'Other';
export type ApplicantType = 'Student' | 'Staff';

export interface ContactRecord {
  status: 'NOT_CONTACTED' | 'CONTACTED';
  method?: 'Phone' | 'SMS' | 'Email' | 'Other';
  notes?: string;
  contactedBy?: string;
  contactDate?: string;
  contactTime?: string;
}

export interface ConfirmedObservation {
  id: string;
  source: string;
  date: string;
  lighting: string;
  viewingAngle: string;
  confidence: 'High' | 'Medium';
}

export interface MovementRecord {
  id: string;
  date: string;
  time: string;
  gate: string;
  camera: string;
  direction: Direction;
  recognitionStatus: RecognitionStatus;
}

export interface Vehicle {
  id: string;
  owner: string;
  applicantType: ApplicantType;
  program?: string;
  department?: string;
  year?: string;
  section?: string;
  position?: string;
  vehicleType: VehicleType;
  makeModel: string;
  color: string;
  plate: string;
  stickerNo?: string;
  gatePassStatus: GatePassStatus;
  validUntil?: string;
  applicationId?: string;
  contactInfo?: string;
  contactRecord?: ContactRecord;
  confirmedObservations: ConfirmedObservation[];
  movementHistory: MovementRecord[];
  issuedBy?: string;
  issuedDate?: string;
  profileInconsistency?: { observedModel: string; date: string } | null;
}

export interface ScanResult {
  vehicleType: VehicleType;
  color: string;
  makeModel: string;
  plate: string;
  appearanceProfile: string;
  vehicleId: string;
}

export interface Application {
  id: string;
  applicantName: string;
  contactInfo: string;
  applicantType: ApplicantType;
  program?: string;
  department?: string;
  year?: string;
  section?: string;
  position?: string;
  status: ApplicationStatus;
  requirementsComplete: boolean;
  attachmentsAvailable: boolean;
  vehicleInfo?: {
    vehicleType: VehicleType;
    makeModel: string;
    color: string;
    plate: string;
    owner: string;
  };
  scanResult?: ScanResult;
  vehicleId?: string;
  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  stickerNo?: string;
  issuedBy?: string;
  issuedDate?: string;
  contactRecord?: ContactRecord;
  history: { action: string; by: string; timestamp: string; note?: string }[];
}

export interface UnknownVehicle {
  id: string;
  gate: string;
  camera: string;
  direction: Direction;
  date: string;
  time: string;
  detectedPlate?: string;
  status: UnknownResolution;
  resolvedTo?: string;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  observedModel?: string;
}

export interface EventLogEntry {
  id: string;
  vehicleId: string;
  date: string;
  time: string;
  gate: string;
  camera: string;
  direction: Direction;
  recognitionStatus: RecognitionStatus;
  gatePassStatus: GatePassStatus;
  detectedPlate?: string;
  evidenceRef?: string;
}

export interface AuditLogEntry {
  id: string;
  who: string;
  what: string;
  when: string;
  target: string;
  resultingStatus?: string;
  reason?: string;
}

export interface CameraConfig {
  id: string;
  name: string;
  gate: string;
  position: CameraPosition;
  status: CameraStatus;
  detectionLineConfigured: boolean;
  entryDirection: string;
  exitDirection: string;
}

export interface SessionInfo {
  userId: string;
  username: string;
  role: Role;
  name: string;
  loginTime: string;
  device: 'GUARD_PHONE' | 'ADMIN_DESKTOP';
}

export interface GatePassRecord {
  stickerNo: string;
  vehicleId: string;
  applicationId: string;
  status: GatePassStatus;
  validUntil: string;
  issuedBy?: string;
  issuedDate?: string;
  contactRecord?: ContactRecord;
}

export interface ScenarioType {
  id: string;
  label: string;
  description: string;
}

export interface AppState {
  users: User[];
  vehicles: Vehicle[];
  applications: Application[];
  unknownVehicles: UnknownVehicle[];
  eventLogs: EventLogEntry[];
  auditLogs: AuditLogEntry[];
  cameras: CameraConfig[];
  gatePasses: GatePassRecord[];
  currentWeather: WeatherCondition;
  guardSession: SessionInfo | null;
  adminSession: SessionInfo | null;
  settings: {
    unknownVerificationMode: 'ADMIN_ONLY' | 'ADMIN_AND_AUTHORIZED_GUARDS';
    currentAcademicYear: string;
    gatePassExpiration: string;
    notificationPrefs: { emailAlerts: boolean; smsAlerts: boolean; unknownVehicleAlerts: boolean };
  };
  nextVehicleSeq: number;
  nextUnknownSeq: number;
  nextApplicationSeq: number;
  liveVehicles: LiveVehicleDetection[];
}

export interface LiveVehicleDetection {
  id: string;
  vehicleId: string;
  label: string;
  status: RecognitionStatus;
  gatePassStatus: GatePassStatus;
  boxColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  moving: boolean;
  observedModel?: string;
  profileInconsistency?: boolean;
}
