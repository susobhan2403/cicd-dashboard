namespace CicdDashboard.Blazor.Models;

public record Kpis(int OrgCompliance, int DeploymentsToday, double ChangeFailureRate, double MttrHours);
public record StreamCompliance(string Stream, int Compliant, int NonCompliant);
public record TrendPoint(string Date, int Compliance, int Releases, double Cfr, double Mttr);
public record ViolationType(string Type, int Count);
public record ReleaseRecord(
    string Date,
    string App,
    string Release,
    string Env,
    string[] FailedGates,
    string Owner,
    int Risk
);
public record UpcomingRelease(string Date, string App, string Release, string Env, int Readiness);