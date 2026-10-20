import Toybox.Application;
import Toybox.WatchUi;

class JorgeApp extends Application.AppBase {
    function initialize() { AppBase.initialize(); }
    function getInitialView() { return [new JorgeFace()]; }
    function onSettingsChanged() { WatchUi.requestUpdate(); }
}
