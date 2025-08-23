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
        const isDark = document.body.classList.contains('theme-dark');
        root.interfaceColors.set('text', am5.color(isDark ? 0xf8fafc : 0x0f172a));
        root.interfaceColors.set('grid', am5.color(isDark ? 0x475569 : 0x94a3b8));
        root.interfaceColors.set('primaryButton', am5.color(0x0b5ed7));
        roots[divId] = root;
        return root;
    }

    function createSparkline(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(am5xy.XYChart.new(root, {
            paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0
        }));
        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererX.new(root, { visible: false }),
            min: 0, max: data.length - 1, strictMinMax: true
        }));
        const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, { visible: false }),
            min: Math.min(...data), max: Math.max(...data)
        }));
        const series = chart.series.push(am5xy.LineSeries.new(root, {
            xAxis, yAxis, valueXField: 'i', valueYField: 'v'
        }));
        series.strokes.template.setAll({ strokeWidth: 2 });
        series.fills.template.setAll({ fillOpacity: 0.2 });
        series.data.setAll(data.map((v, i) => ({ i, v })));
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

        [s1, s2].forEach(series => {
            series.bullets.push(function (root, series, dataItem) {
                const total = dataItem.dataContext.compliant + dataItem.dataContext.nonCompliant;
                const value = dataItem.get('valueY');
                const percent = Math.round((value / total) * 100);
                return am5.Bullet.new(root, {
                    locationY: 0.5,
                    sprite: am5.Label.new(root, {
                        text: percent + '%',
                        fill: root.interfaceColors.get('alternativeText'),
                        centerX: am5.p50,
                        centerY: am5.p50
                    })
                });
            });
        });

        const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50) }));
        legend.data.setAll([s1, s2]);

        xAxis.data.setAll(data);
        s1.data.setAll(data);
        s2.data.setAll(data);
    }

    function createPerformanceChart(divId, data, metric) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(am5xy.XYChart.new(root, { paddingLeft: 10, layout: root.verticalLayout }));

        const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 80 });
        xRenderer.labels.template.setAll({
            rotation: -45,
            centerY: am5.p50,
            centerX: am5.p100
        });

        const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: 'month', count: 1 },
            renderer: xRenderer,
            dateFormats: { day: "MMM dd" },
            tooltipDateFormats: { day: "MMM dd" }
        }));
        const yLeft = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}), min: 0, max: 100, strictMinMax: true }));
        const yRight = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, { opposite: true }), min: 0 }));

        const line = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
            name: metric,
            xAxis, yAxis: yLeft,
            valueYField: metric,
            valueXField: 'date',
            tooltip: am5.Tooltip.new(root, { labelText: '{name}: {valueY}' })
        }));

        const cols = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: 'Releases',
            xAxis, yAxis: yRight,
            valueYField: 'releases',
            valueXField: 'date',
            clustered: false,
            tooltip: am5.Tooltip.new(root, { labelText: '{name}: {valueY}' })
        }));

        const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50) }));
        legend.data.setAll([line, cols]);

        const parsed = data.map(d => ({ ...d, date: new Date(d.date).getTime() }));
        line.data.setAll(parsed);
        cols.data.setAll(parsed);
    }

    function createViolationsDonut(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(
            am5percent.PieChart.new(root, { innerRadius: am5.percent(60) })
        );
        const series = chart.series.push(
            am5percent.PieSeries.new(root, { valueField: 'count', categoryField: 'type' })
        );
        series.slices.template.setAll({ strokeOpacity: 0, tooltipText: '{category}: {valuePercentTotal.formatNumber("0.0")}%' });
        series.data.setAll(data);
        const total = data.reduce((sum, d) => sum + d.count, 0);
        chart.seriesContainer.children.push(
            am5.Label.new(root, {
                text: total.toString(),
                centerX: am5.p50,
                centerY: am5.p50,
                fontSize: 22,
                fontWeight: '600'
            })
        );
        const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50), y: am5.percent(90), layout: root.horizontalLayout }));
        legend.data.setAll(series.dataItems);
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

    return { createComplianceDonut, createComplianceByStream, createPerformanceChart, createViolationsDonut, createSparkline, createViolationsBar, destroy };
})();