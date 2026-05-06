export interface ApplicationData {
  fullName: string;
  email: string;
  dob: string;
  nationality: string;
  studentId?: string;
  institution: string;
  gpa: string;
  credits: string;
  income: string;
}

export interface ApplicationResponse {
  application_id: string;
  run_id: string;
}

export interface ApplicationStatus {
  status: string;
  current_node: string;
  last_event_at: string;
  missing_fields: string[];
}

export interface AgentEvent {
  event_id: number;
  run_id: string;
  node_name: string;
  event_type: 'start' | 'end' | 'error';
  input_summary?: any;
  output_summary?: any;
  latency_ms?: number;
  created_at: string;
}

export interface AgentRunState {
  application_id: string;
  run_id: string;
  scholarship_type?: string;
  routing_decision?: string;
  extracted_data?: any;
  missing_fields?: string[];
  eligibility_result?: any;
  final_decision?: string;
  audit_trail: any[];
}
