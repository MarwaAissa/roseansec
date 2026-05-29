/**
 * Types and interfaces for RoseanSec Platform
 */

export interface LogEvent {
  id: string;
  timestamp: string; // ISO format or HH:MM:SS
  ip: string;
  country: string;
  username: string;
  status: 'SUCCESS' | 'FAILURE';
  userAgent: string;
}

export type AlertSeverity = 'CRITICAL' | 'MEDIUM' | 'LOW';

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  ip: string;
  country: string;
  username: string;
  attemptsCount: number;
  durationSeconds: number;
  userAgent: string;
  user_agent?: string; // and camelCase compatibility
  status?: string;
  details: string;
  recommendations: string[];
  resolved: boolean;
}

export interface SecuritySummary {
  totalLogs: number;
  legitimateCount: number;
  attackCount: number;
  criticalAlerts: number;
  activeIpsBlocked: number;
  topTargetedAccounts: { username: string; count: number }[];
  topAttackingIps: { ip: string; country: string; count: number }[];
}

export interface AzureStorageStatus {
  configured: boolean;
  connectionStringMasked: string;
  containerName: string;
  blobCount: number;
  recentBlobs: { name: string; size: number; date: string }[];
}

export interface EmailConfigStatus {
  configured: boolean;
  smtpUserMasked: string;
  recipientEmail: string;
  lastSentEmail?: {
    to: string;
    subject: string;
    body: string;
    timestamp: string;
  };
}
