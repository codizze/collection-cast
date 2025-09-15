import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FolderOpen, 
  Package, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Calendar
} from "lucide-react";
import heroImage from "@/assets/hero-fashion-factory.jpg";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Clients",
      value: "12",
      change: "+2 this month",
      icon: Users,
      color: "fashion-elegant"
    },
    {
      title: "Collections in Progress",
      value: "8",
      change: "3 due this week",
      icon: FolderOpen,
      color: "fashion-luxury"
    },
    {
      title: "Product Models",
      value: "247",
      change: "+18 this week",
      icon: Package,
      color: "fashion-success"
    },
    {
      title: "Pending Tasks",
      value: "34",
      change: "5 overdue",
      icon: Clock,
      color: "fashion-warning"
    }
  ];

  const recentActivity = [
    {
      client: "Schutz",
      collection: "Spring 2024",
      action: "New model added",
      time: "2 hours ago",
      status: "design"
    },
    {
      client: "Arezzo",
      collection: "Summer Collection", 
      action: "Sample approved",
      time: "4 hours ago",
      status: "approved"
    },
    {
      client: "Luiza Barcelos",
      collection: "Fall Preview",
      action: "Materials updated",
      time: "1 day ago",
      status: "sample"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-primary overflow-hidden">
        <img 
          src={heroImage} 
          alt="Fashion Factory Workspace"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
              Fashion Factory
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl">
              Streamline your private label collections with sophisticated project management
            </p>
            <Button variant="secondary" size="lg" className="shadow-elegant">
              <Plus className="mr-2 h-5 w-5" />
              Create New Collection
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-custom-md hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 text-fashion-${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-0 shadow-custom-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your collections</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-accent flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {activity.client.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.client} • {activity.collection}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={`mb-1 ${
                          activity.status === 'approved' ? 'bg-fashion-success-light text-fashion-success' :
                          activity.status === 'design' ? 'bg-fashion-elegant-light text-fashion-elegant' :
                          'bg-fashion-warning-light text-fashion-warning'
                        }`}
                      >
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Overview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-custom-md">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-primary hover:opacity-90" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Collection
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Users className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Package className="mr-2 h-4 w-4" />
                  Create Product Model
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Review
                </Button>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="border-0 shadow-custom-md border-l-4 border-l-fashion-warning">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-fashion-warning" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">5 tasks overdue</p>
                  <p className="text-muted-foreground">Schutz Spring collection needs review</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Material shortage alert</p>
                  <p className="text-muted-foreground">Croco leather running low</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;