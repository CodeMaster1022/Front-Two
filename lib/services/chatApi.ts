// Mock data for demonstration
import ChatMessage from "@/components/chat-message"
const mockMessages = [
  {
    id: 55,
    user_id: 0,
    thread_id: "string",
    parent_id: "string",
    question:
      "Show me excess inventory where current on-hand inventory exceeds total units sold over the past 6 months",
    result: {
      sql: "SELECT id, description, current_inventory, total_units_sold FROM inventory WHERE current_inventory > total_units_sold",
      result: {
        error: null,
        columns: ["ITEM ID", "DESCRIPTION", "CURRENT INVENTORY", "TOTAL UNITS SOLD"],
        results: [
          { "ITEM ID": "1,011", DESCRIPTION: "Kids Beginner Bike", "CURRENT INVENTORY": 44, "TOTAL UNITS SOLD": 4 },
          { "ITEM ID": "1,012", DESCRIPTION: "Kids Advanced Bike", "CURRENT INVENTORY": 27, "TOTAL UNITS SOLD": 3 },
          { "ITEM ID": "1,010", DESCRIPTION: "Basic Road Bike", "CURRENT INVENTORY": 25, "TOTAL UNITS SOLD": 2 },
          { "ITEM ID": "1,009", DESCRIPTION: "Economy Road Bike", "CURRENT INVENTORY": 25, "TOTAL UNITS SOLD": 3 },
          { "ITEM ID": "1,004", DESCRIPTION: "Elite Cycling Gloves", "CURRENT INVENTORY": 23, "TOTAL UNITS SOLD": 20 },
          { "ITEM ID": "1,003", DESCRIPTION: "Premium Racing Helmet", "CURRENT INVENTORY": 20, "TOTAL UNITS SOLD": 11 },
          { "ITEM ID": "1,016", DESCRIPTION: "Portable Air Pump", "CURRENT INVENTORY": 19, "TOTAL UNITS SOLD": 11 },
          { "ITEM ID": "1,013", DESCRIPTION: "Carbon Fiber Seat", "CURRENT INVENTORY": 17, "TOTAL UNITS SOLD": 7 },
        ],
        success: true,
        row_count: 8,
      },
      suggestions: [
        "Show items with inventory turnover less than 10%",
        "Which products have the highest inventory to sales ratio?",
        "List items that need restocking",
      ],
    },
    created_at: "2025-05-15T07:05:09",
  },
  {
    id: 56,
    user_id: 0,
    thread_id: "string",
    parent_id: "string",
    question: "How many vehicles are available?",
    result: {
      sql: "SELECT COUNT(id) AS available_vehicles FROM fleetp.fleetp.vehicle_details WHERE status = 1 LIMIT 100",
      result: {
        results: [
          {
            available_vehicles: 2,
          },
        ],
        columns: ["available_vehicles"],
        row_count: 1,
        success: true,
        error: null,
      },
      suggestions: ["How many vehicles are available?", "How many trucks do we have?"],
    },
    created_at: "2025-05-15T07:10:22",
  },
]
const API_BASE_URL = "http://localhost:3000/api"
// Mock API service
export const chatApi = {
  sendQuestion: async (question: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const { task_id } = await response.json();
      return task_id;
    } catch (error) {
      console.error("Failed to send question:", error);
      throw error;
    }
  },
  getResponse: async (taskId: string) => {
    try {
      const pollForResult = async (): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/result/${taskId}`);
        
        if (!response.ok) {
          throw new Error(`Polling request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === "completed") {
          return result; // Return the final result
        } else if (result.status === "failed") {
          throw new Error(result.error || "Task failed");
        } else {
          // If still processing, wait and try again
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
          return await pollForResult(); // Recursive call
        }
      };
      
      return await pollForResult();
    } catch (error) {
      console.error("Failed to get response:", error);
      throw error;
    }
  },

  getChatHistory: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      throw error;
    }
  },
}
