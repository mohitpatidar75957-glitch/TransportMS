import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class AlterTable {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/tms_db?useSSL=false&serverTimezone=UTC", "root", "mohit123");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("ALTER TABLE lr_bilty ADD COLUMN created_at DATETIME(6)");
            System.out.println("Column added successfully!");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
