import { AlertCircle } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

interface JoinLobbyAlertProps  {
  msg: string;
}

export function JoinLobbyAlert(message: JoinLobbyAlertProps) {

  return (
    <Alert variant="destructive" className="w-full max-w-sm mx-auto mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {message.msg}
      </AlertDescription>
    </Alert>
  )

}