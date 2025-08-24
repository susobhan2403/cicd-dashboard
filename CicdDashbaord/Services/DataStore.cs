using CicdDashboard.Blazor.Models;

namespace CicdDashboard.Blazor.Services;

public static class DataStore
{
    public static Kpis Kpis => new(OrgCompliance: 82, DeploymentsToday: 47, ChangeFailureRate: 6.4, MttrHours: 1.9);

    // Sparklines (last 7 periods) for KPI tiles
    public static IReadOnlyList<int> SparklineDeploys => new[] { 12, 18, 14, 21, 19, 25, 23 };
    public static IReadOnlyList<int> SparklineCompliance => new[] { 74, 76, 78, 81, 80, 83, 82 };
    public static IReadOnlyList<double> SparklineCfr => new[] { 7.2, 6.8, 6.4, 5.9, 6.1, 5.5, 5.2 };
    public static IReadOnlyList<double> SparklineMttr => new[] { 2.5, 2.2, 1.9, 2.1, 1.8, 1.6, 1.9 };
    public static IReadOnlyList<int> SparklineViolations => new[] { 42, 39, 40, 38, 36, 35, 34 };
    public static IReadOnlyList<int> SparklineUpcoming => new[] { 3, 4, 5, 3, 4, 4, 5 };

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
        new TrendPoint("2025-03-01", 76, 22, 6.3, 2.3),
        new TrendPoint("2025-04-01", 78, 29, 6.1, 2.1),
        new TrendPoint("2025-05-01", 81, 35, 5.7, 1.9),
        new TrendPoint("2025-06-01", 83, 32, 5.4, 1.8),
        new TrendPoint("2025-07-01", 84, 41, 5.2, 1.6),
        new TrendPoint("2025-08-01", 82, 47, 5.0, 1.7)
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

    public static int OpenViolations => Violations.Sum(v => v.Count);
    public static int UpcomingCount => Upcoming.Count();

    public static IEnumerable<ReleaseRecord> NonCompliantReleases => new[]
    {
        new ReleaseRecord("2025-08-22", "EazyFuel API", "v2.7.5", "UAT", new[] {"SAST high", "Coverage <80%"}, "DevOps – Payments", 72),
        new ReleaseRecord("2025-08-22", "Cards Web", "v5.1.2", "PROD", new[] {"SBOM license"}, "Cards – Platform", 63),
        new ReleaseRecord("2025-08-21", "Lending Core", "v3.9.0", "SIT", new[] {"Secrets scan"}, "Lending – Core", 58)
    };

    public static IEnumerable<UpcomingRelease> Upcoming => new[]
    {
        new UpcomingRelease("2025-08-23", "Payments Switch", "v4.12.0", "PROD", 92),
        new UpcomingRelease("2025-08-23", "Treasury Ops", "v1.8.4", "UAT", 88),
        new UpcomingRelease("2025-08-24", "Channels Mobile", "v9.0.1", "PROD", 79)
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