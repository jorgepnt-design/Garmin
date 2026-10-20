import Toybox.Application;
import Toybox.Graphics;
import Toybox.System;
import Toybox.Time;
import Toybox.Time.Gregorian;
import Toybox.WatchUi;
import Toybox.Weather;
import Toybox.ActivityMonitor;

class JorgeFace extends WatchUi.WatchFace {
    var sleeping = false;
    var lastMinute = -1;
    var temperature = "--";
    var distance = "--";
    var battery = "--";
    var weatherOld = false;
    var theme = 0;
    var accent = 0xA8FF24;
    var secondary = 0xFFFFFF;
    var width = 0;
    var height = 0;
    var mainFont;
    var secondsFont;

    function initialize() {
        WatchFace.initialize();
        mainFont = WatchUi.loadResource(Rez.Fonts.ClockMain);
        secondsFont = WatchUi.loadResource(Rez.Fonts.ClockSeconds);
    }

    function onEnterSleep() {
        sleeping = true;
        WatchUi.requestUpdate();
    }
    function onExitSleep() {
        sleeping = false;
        lastMinute = -1;
        WatchUi.requestUpdate();
    }
    function px(v) { return (v * width / 448.0).toNumber(); }
    function py(v) { return (v * height / 486.0).toNumber(); }
    function line(dc, x1, y1, x2, y2) {
        dc.drawLine(px(x1), py(y1), px(x2), py(y2));
    }
    function text(dc, x, y, font, value, color, align) {
        dc.setColor(color, Graphics.COLOR_BLACK);
        dc.drawText(px(x), py(y), font, value, align);
    }

    function refreshData(now) {
        var minute = (now.value() / 60).toNumber();
        if (minute == lastMinute) { return; }
        lastMinute = minute;
        battery = System.getSystemStats().battery.format("%.0f") + "%";
        var activity = ActivityMonitor.getInfo();
        distance = "--";
        if (activity != null && activity.distance != null) {
            distance = (activity.distance / 100000.0).format("%.2f");
        }
        temperature = "--";
        weatherOld = false;
        var weather = Weather.getCurrentConditions();
        if (weather != null && weather.temperature != null) {
            temperature = weather.temperature.format("%.0f");
            if (weather.observationTime != null) {
                weatherOld = (now.value() - weather.observationTime.value()) > 7200;
                if (weatherOld) { temperature = "--"; }
            }
        }
    }

    function setTheme() {
        theme = Application.Properties.getValue("Theme");
        accent = 0xA8FF24;
        secondary = Graphics.COLOR_WHITE;
        if (theme == 1) { accent = 0xE8CD91; secondary = accent; }
        if (theme == 2) { accent = 0xFF2438; }
        if (theme == 3) { accent = 0x00C765; secondary = 0xEF3340; }
    }

    function drawClock(dc, clock, y, showSeconds, dim) {
        var main = clock.hour.format("%02d") + ":" + clock.min.format("%02d");
        var secs = ":" + clock.sec.format("%02d");
        var font = dim ? Graphics.FONT_NUMBER_MEDIUM : mainFont;
        var small = secondsFont;
        var extra = 0;
        if (showSeconds) { extra = dc.getTextWidthInPixels(secs, small) + px(8); }
        var mainWidth = dc.getTextWidthInPixels(main, font);
        var start = ((width - mainWidth - extra) / 2).toNumber();
        dc.setColor(dim ? 0x777777 : (theme == 1 ? accent : Graphics.COLOR_WHITE),
                    Graphics.COLOR_BLACK);
        if (!dim && theme != 1) {
            var hours = clock.hour.format("%02d");
            dc.drawText(start, py(y), font, hours, Graphics.TEXT_JUSTIFY_LEFT);
            dc.setColor(theme == 3 ? Graphics.COLOR_WHITE : accent, Graphics.COLOR_BLACK);
            dc.drawText(start + dc.getTextWidthInPixels(hours, font), py(y), font,
                        ":" + clock.min.format("%02d"), Graphics.TEXT_JUSTIFY_LEFT);
        } else {
            dc.drawText(start, py(y), font, main, Graphics.TEXT_JUSTIFY_LEFT);
        }
        if (showSeconds) {
            dc.setColor(accent, Graphics.COLOR_BLACK);
            var baseline = py(y) + dc.getFontHeight(font) - dc.getFontHeight(small);
            dc.drawText(start + mainWidth + px(8), baseline, small, secs,
                        Graphics.TEXT_JUSTIFY_LEFT);
        }
    }

    function drawCar(dc) {
        // Original vector sedan illustration, not a Tesla logo or photograph.
        dc.setColor(0xFF2438, Graphics.COLOR_BLACK);
        line(dc, 38, 304, 410, 304);
        dc.setColor(0x56636B, Graphics.COLOR_BLACK);
        var points = [[65,300],[76,284],[123,277],[162,247],[245,244],
                      [292,263],[347,275],[379,287],[382,308],[347,312],
                      [331,293],[307,293],[291,312],[142,312],[126,293],
                      [102,293],[88,312],[65,308],[65,300]];
        dc.fillPolygon(points);
        dc.setColor(0xD9DEE5, Graphics.COLOR_BLACK);
        for (var i = 1; i < points.size(); i += 1) {
            line(dc, points[i-1][0], points[i-1][1], points[i][0], points[i][1]);
        }
        line(dc, 137,277, 174,254);
        line(dc, 174,254, 239,252);
        line(dc, 239,252, 280,274);
        line(dc, 137,277, 280,274);
        line(dc, 202,254, 202,302);
        dc.setColor(0x11171C, Graphics.COLOR_BLACK);
        dc.fillPolygon([[137,277],[174,254],[239,252],[280,274]]);
        for (var wheel = 0; wheel < 2; wheel += 1) {
            var x = wheel == 0 ? 114 : 319;
            dc.setColor(0x080A0C, Graphics.COLOR_BLACK);
            dc.fillCircle(px(x), py(311), px(21));
            dc.setColor(0x8A969E, Graphics.COLOR_BLACK);
            dc.drawCircle(px(x), py(311), px(17));
            line(dc, x-12,299,x+12,323);
            line(dc, x-12,323,x+12,299);
            line(dc, x-17,311,x+17,311);
            line(dc, x,294,x,328);
            dc.setColor(0xFF2438, Graphics.COLOR_BLACK);
            line(dc,x+9,302,x+9,320);
        }
    }

    function metricIcon(dc, x, kind) {
        dc.setColor(theme == 1 ? accent : (kind == 2 && theme == 3 ? secondary : accent), Graphics.COLOR_BLACK);
        dc.setPenWidth(2);
        if (kind == 0) {
            dc.drawCircle(px(x-7), py(345), px(9));
            line(dc,x-7,330,x-7,334);
            line(dc,x-21,337,x-18,340);
            line(dc,x+5,333,x+2,337);
            dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_BLACK);
            dc.drawCircle(px(x+2),py(354),px(10));
            dc.drawRoundedRectangle(px(x-15),py(352),px(35),py(15),px(6));
        } else if (kind == 1) {
            dc.fillCircle(px(x+5),py(337),px(5));
            dc.setPenWidth(4);
            line(dc,x,347,x-6,359);
            line(dc,x-6,359,x+5,366);
            line(dc,x+5,366,x+1,378);
            line(dc,x-6,359,x-15,372);
            line(dc,x-15,372,x-22,374);
            line(dc,x-12,350,x,345);
            line(dc,x,345,x+10,355);
            line(dc,x+10,355,x+18,348);
        } else {
            dc.drawCircle(px(x),py(352),px(14));
            line(dc,x,343,x,352);
            line(dc,x,352,x+7,356);
            line(dc,x-12,335,x-18,341);
            line(dc,x+12,335,x+18,341);
            line(dc,x-9,366,x-12,372);
            line(dc,x+9,366,x+12,372);
        }
        dc.setPenWidth(1);
    }

    function drawPortugal(dc) {
        dc.setColor(0x00C765, Graphics.COLOR_BLACK);
        dc.fillRectangle(px(17), py(103), px(4), py(303));
        dc.setColor(0xEF3340, Graphics.COLOR_BLACK);
        dc.fillRectangle(px(427), py(103), px(4), py(303));
        dc.setColor(0xE8CD91, Graphics.COLOR_BLACK);
        dc.drawCircle(px(224), py(50), px(21));
        dc.setColor(0xEF3340, Graphics.COLOR_BLACK);
        dc.fillRectangle(px(212), py(36), px(24), py(25));
        dc.fillCircle(px(224), py(59), px(12));
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_BLACK);
        dc.fillRectangle(px(217), py(40), px(14), py(19));
        dc.fillCircle(px(224), py(57), px(7));
        dc.setColor(0x003399, Graphics.COLOR_BLACK);
        dc.fillRectangle(px(222), py(42), px(4), py(4));
        dc.fillRectangle(px(219), py(48), px(4), py(4));
        dc.fillRectangle(px(226), py(48), px(4), py(4));
        dc.fillRectangle(px(222), py(55), px(4), py(4));
    }

    function metric(dc, x, value, label, color) {
        text(dc, x, 390, Graphics.FONT_SMALL, value, color, Graphics.TEXT_JUSTIFY_CENTER);
        text(dc, x, 431, Graphics.FONT_XTINY, label, 0xA0A5AC, Graphics.TEXT_JUSTIFY_CENTER);
    }

    function onUpdate(dc) {
        width = dc.getWidth();
        height = dc.getHeight();
        setTheme();
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_BLACK);
        dc.clear();
        var clock = System.getClockTime();
        var now = Time.now();
        if (sleeping) {
            // Low pixel count; shift each minute to protect the AMOLED panel.
            var shift = ((clock.min % 5) - 2) * 2;
            drawClock(dc, clock, 190 + shift, false, true);
            return;
        }
        refreshData(now);
        var date = Gregorian.info(now, Time.FORMAT_SHORT);
        var days = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
        var months = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN",
                      "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];
        var dateText = days[date.day_of_week - 1] + ", " + date.day.format("%02d") +
                       ". " + months[date.month - 1];
        var top = theme == 3 ? 94 : 47;
        text(dc, 35, top, Graphics.FONT_XTINY, dateText, secondary, Graphics.TEXT_JUSTIFY_LEFT);
        text(dc, 411, top, Graphics.FONT_XTINY, battery, accent, Graphics.TEXT_JUSTIFY_RIGHT);
        if (theme == 3) { drawPortugal(dc); }
        if (theme == 1) {
            dc.setColor(accent, Graphics.COLOR_BLACK);
            line(dc, 35, 105, 413, 105);
            line(dc, 35, 335, 413, 335);
        }
        drawClock(dc, clock, theme == 3 ? 155 : (theme == 2 ? 100 : 120), true, false);
        if (theme == 2) { drawCar(dc); }
        if (theme == 0) {
            dc.setColor(0x263025, Graphics.COLOR_BLACK);
            for (var n = 0; n < 3; n += 1) {
                dc.setColor(0x263025, Graphics.COLOR_BLACK);
                dc.setPenWidth(7);
                dc.drawCircle(px(82 + n * 142), py(397), px(63));
                dc.setColor(accent, Graphics.COLOR_BLACK);
                dc.drawArc(px(82+n*142),py(397),px(63),Graphics.ARC_CLOCKWISE,90, n==1 ? 170 : 210);
            }
            dc.setPenWidth(1);
            dc.setColor(accent, Graphics.COLOR_BLACK);
            line(dc, 35, 307, 413, 307);
        }
        if (theme != 0) {
            dc.setColor(theme == 1 ? accent : 0x343940, Graphics.COLOR_BLACK);
            line(dc, 153, 365, 153, 450);
            line(dc, 295, 365, 295, 450);
        }
        var alarm = Application.Properties.getValue("AlarmTime");
        if (alarm == null || alarm.length() != 5 ||
            alarm.substring(2,3) != ":") { alarm = "--:--"; }
        metricIcon(dc,82,0);
        metricIcon(dc,224,1);
        metricIcon(dc,366,2);
        metric(dc, 82, temperature + "°C", weatherOld ? "WETTER ALT" : "WETTER", accent);
        metric(dc, 224, distance + " km", "HEUTE", theme == 1 ? accent : Graphics.COLOR_WHITE);
        metric(dc, 366, alarm, "MANUELL*", theme == 3 ? secondary : accent);
    }
}

