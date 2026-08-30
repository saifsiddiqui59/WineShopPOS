import { Link } from "react-router-dom";
import { Printer, ScanBarcode, Tags } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
export default function HardwareSetup() {
  return <div><PageHeader title="Hardware & Device Setup" subtitle="Keep scanner and printer setup in one predictable place."/>
    <div className="capability-grid">
      <Link className="capability-card" to="/admin/hardware/scanner"><ScanBarcode/><div><strong>Barcode Scanner</strong><span>Detection speed, global listener and beep tests.</span></div></Link>
      <Link className="capability-card" to="/admin/hardware/printer"><Printer/><div><strong>Receipt Printer</strong><span>58/80mm receipt settings and print test.</span></div></Link>
      <Link className="capability-card" to="/products/labels"><Tags/><div><strong>Barcode Labels</strong><span>Generate and print product barcode labels.</span></div></Link>
    </div>
  </div>;
}
