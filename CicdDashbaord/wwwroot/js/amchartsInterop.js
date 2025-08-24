// amCharts v5 interop for Blazor
// Stores roots per divId so we can dispose/update safely.
window.amchartsInterop = (function () {
    const roots = {};
    function ensureLibs() {
        if (!window.am5 || !window.am5xy || !window.am5percent || !window.am5radar || !window.am5themes_Animated) {
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
        root.dom.style.overflow = 'hidden';
        root.dom.style.backgroundColor = 'transparent';
        root.dom.classList.remove('skeleton');
        const isDark = document.body.classList.contains('theme-dark');
        root.interfaceColors.set('text', am5.color(isDark ? 0xf8fafc : 0x0f172a));
        root.interfaceColors.set('grid', am5.color(isDark ? 0x475569 : 0x94a3b8));
        root.interfaceColors.set('primaryButton', am5.color(0x0b5ed7));
        root._logo?.dispose();
        roots[divId] = root;
        return root;
    }

    function createSparkline(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(am5xy.XYChart.new(root, {
            paddingLeft: 5, paddingRight: 5, paddingTop: 2, paddingBottom: 2
        }));
        const xRenderer = am5xy.AxisRendererX.new(root, { visible: false });
        xRenderer.labels.template.set('visible', false);
        xRenderer.grid.template.set('visible', false);
        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            renderer: xRenderer,
            min: 0, max: data.length - 1, strictMinMax: true
        }));
        const yRenderer = am5xy.AxisRendererY.new(root, { visible: false });
        yRenderer.labels.template.set('visible', false);
        yRenderer.grid.template.set('visible', false);
        const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            renderer: yRenderer,
            min: Math.min(...data), max: Math.max(...data)
        }));
        const series = chart.series.push(am5xy.LineSeries.new(root, {
            xAxis, yAxis, valueXField: 'i', valueYField: 'v'
        }));
        series.strokes.template.setAll({ strokeWidth: 2 });
        series.fills.template.setAll({ fillOpacity: 0.2 });
        series.data.setAll(data.map((v, i) => ({ i, v })));
        series.appear(0, 0);
        chart.appear(0, 0);
    }

    function createGauge(divId, value, max) {
        if (!ensureLibs()) return;
        if (!am5radar) {
            console.error("amCharts radar module not loaded. Check CDN tags in index.html.");
            return;
        }
        const root = newRoot(divId);
        var chart = root.container.children.push(
            am5radar.RadarChart.new(root, {
                panX: false,
                panY: false,
                startAngle: 180,
                endAngle: 360
            })
        );

        var axisRenderer = am5radar.AxisRendererCircular.new(root, {
            innerRadius: -10,
            strokeOpacity: 1,
            strokeWidth: 15,
            strokeGradient: am5.LinearGradient.new(root, {
                rotation: 0,
                stops: [
                    { color: am5.color(0xfb7116) },
                    { color: am5.color(0xf6d32b) },
                    { color: am5.color(0xf4fb16) },
                    { color: am5.color(0x19d228) },
                ]
            })
        });

        var xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0,
                min: 0,
                max: max,
                strictMinMax: true,
                renderer: axisRenderer
            })
        );

        var axisDataItem = xAxis.makeDataItem({});
        axisDataItem.set("value", value);

        var clockHand = am5radar.ClockHand.new(root, {
            pinRadius: am5.percent(20),
            radius: am5.percent(100),
            bottomWidth: 20
        })

        var bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(root, {
            sprite: clockHand
        }));
        var label = chart.radarContainer.children.push(am5.Label.new(root, {
            fill: am5.color(0xffffff),
            centerX: am5.percent(50),
            textAlign: "center",
            centerY: am5.percent(50),
            fontSize: "1.5em"
        }));
        bullet.get("sprite").on("rotation", function () {
            var value = axisDataItem.get("value");
            var text = Math.round(axisDataItem.get("value")).toString();
            var fill = am5.color(0x000000);
            xAxis.axisRanges.each(function (axisRange) {
                if (value >= axisRange.get("value") && value <= axisRange.get("endValue")) {
                    fill = axisRange.get("axisFill").get("fill");
                }
            })
            console.log('fill', fill);
            label.set("text", Math.round(value).toString());

            clockHand.pin.animate({ key: "fill", to: fill, duration: 500, easing: am5.ease.out(am5.ease.cubic) })
            clockHand.hand.animate({ key: "fill", to: fill, duration: 500, easing: am5.ease.out(am5.ease.cubic) })
        });
        xAxis.createAxisRange(axisDataItem);

        axisDataItem.get("grid").set("visible", false);
       
        // Make stuff animate on load
        chart.appear(1000, 100);
    }

    function createComplianceDonut(divId, compliantPercent) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(
            am5percent.PieChart.new(root, { innerRadius: am5.percent(70), paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10 })
        );
        const series = chart.series.push(
            am5percent.PieSeries.new(root, { valueField: "value", categoryField: "category" })
        );
        series.slices.template.setAll({ strokeOpacity: 0, tooltipText: "{category}: {value}%" });
        series.labels.template.set('visible', false);
        series.ticks.template.set('visible', false);
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
        root.container.setAll({ layout: root.verticalLayout, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, height: am5.percent(100) });

        const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout }));
        chart.setAll({ centerX: am5.p50, x: am5.p50 });

        const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 20 });
        xRenderer.labels.template.setAll({ fontSize: 12 });
        const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "stream",
            renderer: xRenderer
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

        const legend = root.container.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50),
            marginTop: 10,
            layout: root.horizontalLayout
        }));
        legend.labels.template.setAll({ oversizedBehavior: 'wrap', fontSize: 12 });
        legend.data.setAll([s1, s2]);

        xAxis.data.setAll(data);
        s1.data.setAll(data);
        s2.data.setAll(data);
    }

    function createPerformanceChart(divId, data, metric) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        root.container.setAll({ layout: root.verticalLayout, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 });

        const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout }));
        chart.setAll({ centerX: am5.p50, x: am5.p50 });

        const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 80 });
        xRenderer.labels.template.setAll({
            rotation: -45,
            centerY: am5.p50,
            centerX: am5.p100,
            fontSize: 12
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

        const legend = root.container.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50),
            marginTop: 10,
            layout: root.horizontalLayout
        }));
        legend.labels.template.setAll({ oversizedBehavior: 'wrap', fontSize: 12 });
        legend.data.setAll([line, cols]);

        const parsed = data.map(d => ({ ...d, date: new Date(d.date).getTime() }));
        line.data.setAll(parsed);
        cols.data.setAll(parsed);
    }

    function createViolationsDonut(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        root.container.setAll({ paddingTop: 1, paddingRight: 1, paddingBottom: 1, paddingLeft: 1, layout: root.verticalLayout });
        var chart = root.container.children.push(
            am5percent.PieChart.new(root, {
                endAngle: 270,
                layout: root.verticalLayout,
                innerRadius: am5.percent(60)
            })
        );
        chart.seriesContainer.setAll({ width: am5.percent(80), height: am5.percent(80) });
        var series = chart.series.push(
            am5percent.PieSeries.new(root, {
                valueField: "count",
                categoryField: "type",
                endAngle: 270
            })
        );

        series.set("colors", am5.ColorSet.new(root, {
            colors: [
                am5.color(0x73556E),
                am5.color(0x9FA1A6),
                am5.color(0xF2AA6B),
                am5.color(0xF28F6B),
                am5.color(0xA95A52),
                am5.color(0xE35B5D),
                am5.color(0xFFA446)
            ]
        }))

        var gradient = am5.RadialGradient.new(root, {
            stops: [
                { color: am5.color(0x000000) },
                { color: am5.color(0x000000) },
                {}
            ]
        })

        series.slices.template.setAll({
            fillGradient: gradient,
            strokeWidth: 2,
            stroke: am5.color(0xffffff),
            cornerRadius: 10,
            shadowOpacity: 0.1,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowColor: am5.color(0x000000),
            fillPattern: am5.GrainPattern.new(root, {
                maxOpacity: 0.2,
                density: 0.5,
                colors: [am5.color(0x000000)]
            })
        })

        series.slices.template.states.create("hover", {
            shadowOpacity: 1,
            shadowBlur: 10
        })

        series.ticks.template.setAll({
            strokeOpacity: 0.4,
            strokeDasharray: [2, 2]
        })
        series.labels.template.set("visible", false);
        series.ticks.template.set("visible", false);
        series.states.create("hidden", {
            endAngle: -90
        });
        series.data.setAll(data);

        let legend = chart.children.push(am5.Legend.new(root, {
            paddingLeft: 0,
            paddingRight:0,
            centerX: am5.percent(50),
            x: am5.percent(50),
            layout: am5.GridLayout.new(root, {
                maxColumns: 3,
                fixedWidthGrid: true
            })
        }));
        legend.markers.template.setAll({
            width: 20,
            height: 20
        });
        legend.markerRectangles.template.adapters.add("fillGradient", function () {
            return undefined;
        })
        legend.labels.template.setAll({
            fontSize: 10,
            fontWeight: "300"
        });

       // legend.valueLabels.template.set("forceHidden", true);
        legend.valueLabels.template.setAll({
            fontSize: 13,
            fontWeight: "400"
        });
        legend.data.setAll(series.dataItems);

        series.appear(1000, 100);
    }

    function createViolationsBar(divId, data) {
        if (!ensureLibs()) return;
        const root = newRoot(divId);
        const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10 }));
        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}), min: 0 }));
        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { categoryField: "type", renderer: am5xy.AxisRendererY.new(root, { inversed: true }) }));
        const series = chart.series.push(am5xy.ColumnSeries.new(root, { name: "Violations", xAxis, yAxis, valueXField: "count", categoryYField: "type" }));
        series.columns.template.setAll({ tooltipText: "{categoryY}: {valueX}", strokeOpacity: 0 });
        yAxis.data.setAll(data);
        series.data.setAll(data);
    }

    return { createComplianceDonut, createComplianceByStream, createPerformanceChart, createViolationsDonut, createSparkline, createGauge, createViolationsBar, destroy };
})();