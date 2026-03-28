import { useMemo } from "react";
import { useAppStore } from "@client/services/store";
import "./spinner.css";

//
// Spinner
// Show/hide a spinner according to AppState.spinner.count
//
export default function Spinner() {
  const spinnerCount = useAppStore((state) => state.spinner.count);

  const spinner = useMemo(() => {
    return (
      <div role = "spinner" className = "absolute-center-child">
        <div className = "spinner">
          {/* Many thanks to https://github.com/SamHerbert/SVG-Loaders */}
          <svg
            width = "4em"
            viewBox = "0 0 120 30"
            xmlns = "http://www.w3.org/2000/svg"
            fill = "#F26D21"
            stroke = "#F7EFE2"
          >
            <circle cx = "15" cy = "15" r = "15">
              <animate
                attributeName = "r"
                from = "15"
                to = "15"
                begin = "0s"
                dur = "0.8s"
                values = "15;9;15"
                calcMode = "linear"
                repeatCount = "indefinite"
              />
              <animate
                attributeName = "fill-opacity"
                from = "1"
                to = "1"
                begin = "0s"
                dur = "0.8s"
                values = "1;.5;1"
                calcMode = "linear"
                repeatCount = "indefinite"
              />
            </circle>
            <circle cx = "60" cy = "15" r = "9" fillOpacity = "0.3">
              <animate
                attributeName = "r"
                from = "9"
                to = "9"
                begin = "0s"
                dur = "0.8s"
                values = "9;15;9"
                calcMode = "linear"
                repeatCount = "indefinite"
              />
              <animate
                attributeName = "fill-opacity"
                from = "0.5"
                to = "0.5"
                begin = "0s"
                dur = "0.8s"
                values = ".5;1;.5"
                calcMode = "linear"
                repeatCount = "indefinite"
              />
            </circle>
            <circle cx = "105" cy = "15" r = "15">
              <animate
                attributeName = "r"
                from = "15"
                to = "15"
                begin = "0s"
                dur = "0.8s"
                values = "15;9;15"
                calcMode = "linear"
                repeatCount = "indefinite"
              />
              <animate
                attributeName = "fill-opacity"
                from = "1"
                to = "1"
                begin = "0s"
                dur = "0.8s"
                values = "1;.5;1"
                calcMode = "linear"
                repeatCount = "indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>
    );
  }, []);

  return spinnerCount === 0 ? <></> : spinner;
}
