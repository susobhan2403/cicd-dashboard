using CicdDashboard.Blazor.Models;

namespace CicdDashboard.Blazor.Services;

public static class DataStore
{
    public static Kpis Kpis => new(OrgCompliance: 82, DeploymentsToday: 47, ChangeFailureRate: 6.4, MttrHours: 1.9);

    public static IEnumerable<StreamCompliance> Streams => new[]
    {
        new StreamCompliance("Payments", 28, 4),
        new StreamCompliance("Lending", 19, 6),
        new StreamCompliance("Cards", 16, 3),
        new StreamCompliance("Channels", 21, 7),
        new StreamCompliance("Treasury", 12, 2)
    };

    public static IEnumerable<TrendPoint> Trend => new[]
    {
        new TrendPoint("2025-08-01", 76, 22),
        new TrendPoint("2025-08-05", 78, 29),
        new TrendPoint("2025-08-09", 81, 35),
        new TrendPoint("2025-08-13", 83, 32),
        new TrendPoint("2025-08-17", 84, 41),
        new TrendPoint("2025-08-21", 82, 47)
    };

    public static IEnumerable<ViolationType> Violations => new[]
    {
        new ViolationType("SAST High/Critical", 9),
        new ViolationType("Dependency (Known CVEs)", 12),
        new ViolationType("Secrets in Repo", 4),
        new ViolationType("Coverage < 80%", 7),
        new ViolationType("DAST Blockers", 5),
        new ViolationType("SBOM/License Violations", 6)
    };

    public static IEnumerable<ReleaseRecord> NonCompliantReleases => new[]
    {
        new ReleaseRecord("2025-08-22 21:14", "EazyFuel API", "v2.7.5", "UAT", new[] {"SAST high", "Coverage <80%"}, "DevOps – Payments", 72),
        new ReleaseRecord("2025-08-22 19:05", "Cards Web", "v5.1.2", "PROD", new[] {"SBOM license"}, "Cards – Platform", 63),
        new ReleaseRecord("2025-08-21 10:48", "Lending Core", "v3.9.0", "SIT", new[] {"Secrets scan"}, "Lending – Core", 58)
    };

    public static IEnumerable<UpcomingRelease> Upcoming => new[]
    {
        new UpcomingRelease("2025-08-23 16:00", "Payments Switch", "v4.12.0", "PROD", 92),
        new UpcomingRelease("2025-08-23 19:30", "Treasury Ops", "v1.8.4", "UAT", 88),
        new UpcomingRelease("2025-08-24 09:00", "Channels Mobile", "v9.0.1", "PROD", 79)
    };

    public static readonly string[] MandatoryGates = new[]
    {
        "SAST: No Critical/High vulns (blocker)",
        "DAST: No High blockers on target env",
        "Secrets Scan: Zero hardcoded secrets",
        "SBOM + License: Allowed licenses only; CVE policy enforced",
        "Unit Test Coverage ≥ 80% (gate)",
        "2 Code Reviews (MR approvals) & signed commits",
        "Change Ticket linked (ServiceNow/Jira) with CAB policy",
        "Dependency/Container scan passed (no Critical/High)",
        "IaC scan passed (K8s/Terraform policies)",
        "Deploy approval (non‑prod → prod promotion rules)",
        "Rollback verified (recent success within 30 days)"
    };
}