import Toybox.Application;
import Toybox.WatchUi;

class JorgeApp extends Application.AppBase {
    function initialize() { AppBase.initialize(); }
    function getInitialView() { var face = new JorgeFace(); return [face, new JorgeDelegate(face)]; }
    function onSettingsChanged() { WatchUi.requestUpdate(); }
}

