/**
 * v0.4.3 -- Request body for file approval endpoint.
 *
 * VULN (v0.4.3): No requester tracking. The endpoint doesn't record
 *       which moderator/admin approved the file. This absence of audit
 *       information is CWE-532 (Insertion of Sensitive Information into Log File).
 *       Remediation (v0.4.4): Track approvedBy userId and timestamp.
 */
export class ApproveFileDto {
  /**
   * Approval status. The endpoint accepts both 'approved' and 'rejected'
   * to allow moderators to reject files that violate policy.
   *
   * Note: The ternary role system (v0.4.3) creates ambiguity:
   * - Can a moderator reject an admin-approved file?
   * - Can an admin override a moderator rejection?
   * These scenarios are intentionally undefined (CWE-841).
   */
  status: 'approved' | 'rejected' = 'approved';
}
