# Dual-Portal Clinical Architecture: Patient Sentinel & Multi-Hospital Admin Collaboration

Architectural blueprint for separating NeuroShield into two distinct portal gateways with dedicated authentication (Admin OTP verification with Name, Email, and Phone), a collaborative multi-hospital stroke specialist network, strict hardware-level camera/mic isolation reserved exclusively for patients, and remote CCTV clinical surveillance.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 clarification:
> - **Portal Gateway**: A dedicated entry selection screen with two distinct login experiences for Patients and Admins.
> - **Doctor & Hospital Collaboration**: Comprehensive multi-hospital referral directory, specialist roster (neurologists, physiatrists, speech therapists), and patient assignment/transfer workflows.
> - **Hardware Sensor Isolation**: Camera and microphone hardware access is strictly restricted to Patients. Admin devices never capture local camera/mic input, but Admins retain live remote observation access to patient camera feeds and facility CCTV streams.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms NeuroShield into a partitioned dual-portal healthcare platform. Patients access a specialized ambient monitoring and therapy environment where their camera and microphone run continuous computer vision (EAR blink tracking, facial droop detection, fall analysis). Clinical Admins authenticate via a 4-field verification gate (Name, Email, Phone, OTP) to access a clinical command center featuring multi-hospital collaboration, doctor rosters, patient bed assignments, and live remote CCTV observation without activating their own local media devices.
- **Target Audience / Persona**:
  - *Post-Stroke Patients & Caregivers*: Requiring simple, supportive, accessible tools with continuous safety monitoring.
  - *Clinical Administrators, Neurologists & Charge Nurses*: Requiring multi-ward oversight, hospital referral networks, emergency dispatch coordination, and zero accidental broadcast of their own camera/mic.
- **Key Value**: Guarantees patient safety and clinician privacy while connecting bedside telemetry to an integrated network of stroke hospitals and specialist physicians.

---

### 2. User Experience & Visual Design

#### A. Key User Flows

1. **Initial Portal Gateway**:
   - The user arrives at a dual-card selection landing screen: **Patient Recovery Portal** vs. **Clinical Admin Portal**.
   - Immediate language switcher available in English, Tamil, Hindi, Malayalam, and Telugu.
2. **Patient Entry Flow**:
   - Direct, low-friction patient setup: confirms Patient Name, Room/Bed ID, and Emergency Contact.
   - Camera and microphone permissions requested and immediately engaged for ambient sentinel protection.
   - Access to Rehabilitation Library, Daily Routine, Health Log, Document AI, and Stroke Exercises.
3. **Admin Authentication & OTP Flow**:
   - Secure Admin Login Form:
     - Full Name (e.g. *Dr. Priya Varma*)
     - Official Clinical Email ID (e.g. *priya.varma@apollo-neuro.org*)
     - Mobile Phone Number (e.g. *+91 98401 23456*)
   - *Send OTP* dispatches a 6-digit verification code with countdown timer.
   - Successful verification grants access to the Admin Clinical Command Center.
   - **Local Camera & Mic Remain OFF**: Local media streams are never requested or opened on Admin hardware.
4. **Doctor & Hospital Collaboration Hub (Admin View)**:
   - *Hospital Network Directory*: Profiles of affiliated stroke centers (e.g., Apollo Neuro Institute, Christian Medical College Stroke Unit, AIIMS Stroke Center, Fortis Neurosciences).
   - *Specialist Roster*: Attending neurologists, neuro-rehab specialists, and speech-language pathologists with availability, active patient load, and on-call status.
   - *Patient Assignment & Referral Action*: Assign a patient to an attending doctor, schedule emergency telestroke consults, or initiate inter-hospital transfer.
5. **Remote Patient Camera & CCTV Surveillance (Admin View)**:
   - Admin views the live video stream from Patient Room 104 and facility IP CCTV cameras.
   - Real-time telemetry overlaid: EAR eye ratio, facial symmetry %, arm stability, and emergency alert audit trail.

#### B. Visual Identity & Theme

- **Aesthetic Direction**: Clinical, high-contrast, publication-grade dark slate (`#0B0F19`) with crisp Google/DeepMind medical accents.
- **Palette**:
  - *Canvas*: `#0B0F19` (Deep Obsidian Slate)
  - *Surfaces*: `#111827` (Charcoal Slate Cards) with `1px solid #1F2937` hairline borders.
  - *Patient Primary*: `#0284C7` (Sky Blue) & `#0D9488` (Teal)
  - *Admin Primary*: `#059669` (Clinical Emerald) & `#4F46E5` (Indigo)
  - *Emergency & Critical Alerts*: `#DC2626` (Crimson) & `#D97706` (Amber)
- **Typography**: Clean display sans (`Plus Jakarta Sans` / `Outfit`) for structured UI, paired with monospace tabular figures (`font-mono tabular-nums`) for timestamps, vitals, IP addresses, and OTP codes.
- **Strict Anti-Slop Rules**: Zero unboxed pill badge clutter, no fake compiler/execution tags, single-level card elevation, and single-line controls (`whitespace-nowrap shrink-0`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hardware-Level Media Isolation for Admins**:
  - *Chosen Approach*: `getUserMedia` is conditionally executed strictly when `portal === 'patient'`. If the user is in Admin mode, local camera and mic tracks are explicitly stopped or never requested.
  - *Why*: Satisfies the explicit requirement that camera and mic are reserved only for patients, preventing accidental clinician recording while still allowing clinicians to receive patient CCTV streams over WebRTC/RTSP.
- **Decision 2: 4-Field Admin Login with Simulated Realistic OTP Verification**:
  - *Chosen Approach*: Form captures Name, Email, and Phone Number, triggers a simulated SMS/Email OTP (`789012`), and provides an instant test autofill button for testing efficiency.
  - *Why*: Eliminates security friction during evaluation while implementing the exact authentication specification requested.
- **Decision 3: Dedicated Landing Gate with Portal Switcher**:
  - *Chosen Approach*: A distinct initial screen letting users explicitly choose between Patient and Admin roles, with an authenticated session toggle in the top bar and profile widget.
  - *Why*: Gives clean role separation without forcing users through a single generic login screen.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INITIAL PORTAL GATEWAY LANDING                        │
│                 (Role Selection: Patient vs. Clinical Admin)                │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
                        ▼                             ▼
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │     PATIENT PORTAL FLOW      │ │      ADMIN AUTHENTICATION    │
       │                              │ │  (Name + Email + Phone + OTP)│
       └──────────────┬───────────────┘ └──────────────┬───────────────┘
                      │                                │
                      ▼                                ▼
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │     PATIENT HARDWARE HUB     │ │    ADMIN COMMAND CENTER      │
       │ • Camera ALWAYS ON (WebRTC)  │ │ • Local Cam/Mic DISABLED     │
       │ • Microphone ALWAYS ON       │ │ • Live Remote Patient Stream │
       │ • Real-time EAR Eye Blink    │ │ • Multi-Hospital Network     │
       │ • Optical Flow Fall Detector │ │ • Doctor Roster & Assignment │
       │ • Rehabilitation Library     │ │ • CCTV & IP Camera Matrix    │
       │ • Daily Routine & Health Log │ │ • Emergency Dispatch Center  │
       │ • Medical Document AI (OCR)  │ │ • Patient Recovery Telemetry │
       └──────────────────────────────┘ └──────────────────────────────┘
```

#### State & Data Model Extensions

- **AdminProfile**:
  ```typescript
  interface AdminProfile {
    name: string;
    email: string;
    phone: string;
    hospitalId: string;
    verified: boolean;
  }
  ```
- **Hospital & Doctor Collaboration Schema**:
  ```typescript
  interface Hospital {
    id: string;
    name: string;
    location: string;
    strokeCenterTier: 'Comprehensive Stroke Center (CSC)' | 'Primary Stroke Center (PSC)';
    emergencyPhone: string;
    availableBeds: number;
    activeReferrals: number;
  }

  interface DoctorSpecialist {
    id: string;
    name: string;
    role: 'Neurologist' | 'Neuro-Physiatrist' | 'Speech-Language Pathologist' | 'Vascular Surgeon';
    hospitalId: string;
    hospitalName: string;
    phone: string;
    email: string;
    availability: 'AVAILABLE' | 'IN_CONSULT' | 'ON_CALL';
    assignedPatientsCount: number;
  }
  ```
- **Portal & Hardware Permissions Routing**:
  - `isCameraActive`: strictly `portal === 'patient'`
  - `isMicActive`: strictly `portal === 'patient'`
  - `remoteCctvFeeds`: available in Admin mode for remote viewing without Admin hardware activation.
