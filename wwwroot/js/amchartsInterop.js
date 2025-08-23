// amCharts v5 interop for Blazor
// Stores roots per divId so we can dispose/update safely.
window.amchartsInterop = (function () {
    const roots = {};
    function ensureLibs() {
        if (!window.am5 || !window.am5xy || !window.am5percent || !window.am5themes_Animated) {
            console.error("amCharts v5 libraries not loaded. Check CDN tags in index.html.");
            return false;
        }
        return true;
    }
    function destroy(divId) {
        const root = roots[divId];
        if (root) {
            root.dispose();
            delete roots[divId];
        }
    }
    function newRoot(divId) {
        destroy(divId);
        const root = am5.Root.new(divId);
        root.setThemes([am5themes_Animated.new(root)]);
        roots[divId] = root;
        return root;
    }

    function createComplianceDonut(divId, compliantPercent) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(
            am5percent.PieChart.new(root, { innerRadius: am5.percent(70) })
        );
        const series = chart.series.push(
            am5percent.PieSeries.new(root, { valueField: "value", categoryField: "category" })
        );
        series.slices.template.setAll({ strokeOpacity: 0, tooltipText: "{category}: {value}%" });
        series.data.setAll([
            { category: "Compliant", value: compliantPercent },
            { category: "Non-compliant", value: 100 - compliantPercent },
        ]);
        chart.seriesContainer.children.push(
            am5.Label.new(root, {
                text: compliantPercent + "%",
                centerX: am5.percent(50),
                centerY: am5.percent(50),
                fontSize: 24,
                fontWeight: "600",
                fill: am5.color(0x111827)
            })
        );
    }

    function createComplianceByStream(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout }));
        const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "stream",
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 20 })
        }));
        const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }));

        const s1 = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: "Compliant", xAxis, yAxis, valueYField: "compliant", categoryXField: "stream", stacked: true
        }));
        const s2 = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: "Non-compliant", xAxis, yAxis, valueYField: "nonCompliant", categoryXField: "stream", stacked: true
        }));

        s1.columns.template.setAll({ tooltipText: "{name}: {valueY}", strokeOpacity: 0 });
        s2.columns.template.setAll({ tooltipText: "{name}: {valueY}", strokeOpacity: 0 });

        const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50) }));
        legend.data.setAll([s1, s2]);

        xAxis.data.setAll(data);
        s1.data.setAll(data);
        s2.data.setAll(data);
    }

    function createComplianceTrend(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(am5xy.XYChart.new(root, { focusable: true, paddingLeft: 10, layout: root.verticalLayout }));

        const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: "day", count: 1 },
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 40 })
        }));
        const yLeft = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}), min: 0, max: 100, strictMinMax: true }));
        const yRight = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, { opposite: true }), min: 0 }));

        const sCompliance = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
            name: "Compliance %",
            xAxis, yAxis: yLeft,
            valueYField: "compliance",
            valueXField: "date",
            tooltip: am5.Tooltip.new(root, { labelText: "{name}: {valueY}%" })
        }));

        const sReleases = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: "Releases",
            xAxis, yAxis: yRight,
            valueYField: "releases",
            valueXField: "date",
            clustered: false,
            tooltip: am5.Tooltip.new(root, { labelText: "{name}: {valueY}" })
        }));

        const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50) }));
        legend.data.setAll([sCompliance, sReleases]);

        const parsed = data.map(d => ({ ...d, date: new Date(d.date).getTime() }));
        sCompliance.data.setAll(parsed);
        sReleases.data.setAll(parsed);
    }

    function createViolationsBar(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout }));
        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}), min: 0 }));
        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { categoryField: "type", renderer: am5xy.AxisRendererY.new(root, { inversed: true }) }));
        const series = chart.series.push(am5xy.ColumnSeries.new(root, { name: "Violations", xAxis, yAxis, valueXField: "count", categoryYField: "type" }));
        series.columns.template.setAll({ tooltipText: "{categoryY}: {valueX}", strokeOpacity: 0 });
        yAxis.data.setAll(data);
        series.data.setAll(data);
    }

    return { createComplianceDonut, createComplianceByStream, createComplianceTrend, createViolationsBar, destroy };
})();