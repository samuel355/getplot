"use client";
import Link from "next/link";
import {
  Loader,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

const Dashboard = () => {
  const [trabuomPlots, setTrabuomPlots] = useState();
  const [nthcPlots, setNTHCPlots] = useState();
  const [legonHillsPlots, setLegonHillsPlots] = useState();
  const [adensePlots, setAdensePlots] = useState();
  const [berekusoPlots, setBerekusoPlots] = useState();
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {    
    fetchPlots("trabuom");
    fetchPlots("dar_es_salaam");
    fetchPlots("nthc");
    fetchPlots("legon_hills");
    fetchPlots("berekuso");
    fetchUsers();
  }, []);
  
  const fetchPlots = async (databaseName) => {
    try {
      setLoading(true);
      const { count, error: countError } = await supabase
        .from(databaseName)
        .select("*", { count: "exact" });

      if (countError) {
        console.log(error);
      }
      if (databaseName === "trabuom") {
        setTrabuomPlots(count);
        setLoading(false);
      }
      if (databaseName === "dar_es_salaam") {
        setAdensePlots(count);
        setLoading(false);
      }
      if (databaseName === "legon_hills") {
        setLegonHillsPlots(count);
        setLoading(false);
      }
      if (databaseName === "nthc") {
        setNTHCPlots(count);
        setLoading(false);
      }
      if (databaseName === "berekuso") {
        setBerekusoPlots(count);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/users"); //api/users
      if (!response.ok) {
        setUsersLoading(false);
        throw new Error("Failed to fetch client list");
      }
      const data = await response.json();
      if (data) {
        setUsersList(data.data);
        setUsersLoading(false);
      }
    } catch (error) {
      setUsersLoading(false);
      console.log(error.message);
    }
  };
  
  return (
    <div className="flex w-full flex-col -mt-4">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background">
        <nav className="flex gap-3 text-base flex-wrap pb-4 lg:mb-0 md:mb-0 xl:mb-0">
          <Link
            href="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/trabuom"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Trabuom
          </Link>
          <Link
            href="/dashboard/nthc"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            NTHC (Kumasi)
          </Link>
          <Link
            href="/dashboard/legon-hills"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            NTHC(Santeo)
          </Link>
            <Link
              href="/dashboard/dar-es-salaam"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dar Es Salaam
            </Link>
            <Link
              href="/dashboard/berekuso"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Berekuso
            </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-3 mt-5">
        <div className="grid gap-3 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Plots at Trabuom
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col justify-center items-center">
                  <Loader size={12} className="animate-spin" />
                </div>
              )}
              <div className="text-2xl font-bold">
                {trabuomPlots?.toLocaleString()}
              </div>
              <Link
                className="text-primary text-xs mt-2 font-medium"
                href={"/dashboard/trabuom"}
              >
                View Plots
              </Link>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Plots at Santeo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col justify-center items-center">
                  <Loader size={12} className="animate-spin" />
                </div>
              )}
              <div className="text-2xl font-bold">
                {legonHillsPlots?.toLocaleString()}
              </div>
              <Link
                className="text-primary text-xs mt-2 font-medium"
                href={"/dashboard/legon-hills"}
              >
                View Plots
              </Link>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Plots at NTHC (Kumasi)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col justify-center items-center">
                  <Loader size={12} className="animate-spin" />
                </div>
              )}
              <div className="text-2xl font-bold">
                {nthcPlots?.toLocaleString()}
              </div>
              <Link
                className="text-primary text-xs mt-2 font-medium"
                href={"/dashboard/nthc"}
              >
                View Plots
              </Link>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Plots at Dar Es Salaam
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col justify-center items-center">
                  <Loader size={12} className="animate-spin" />
                </div>
              )}
              <div className="text-2xl font-bold">
                {adensePlots?.toLocaleString()}
              </div>
              <Link
                className="text-primary text-xs mt-2 font-medium"
                href={"/dashboard/dar-es-salaam"}
              >
                View Plots
              </Link>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Plots at Berekuso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col justify-center items-center">
                  <Loader size={12} className="animate-spin" />
                </div>
              )}
              <div className="text-2xl font-bold">
                {berekusoPlots?.toLocaleString()}
              </div>
              <Link
                className="text-primary text-xs mt-2 font-medium"
                href={"/dashboard/berekuso"}
              >
                View Plots
              </Link>
            </CardContent>
          </Card>   
          </div>
        <div className="grid gap-4 md:gap-8 grid-cols-1 mt-3">
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              {usersLoading && (
                <div className="flex flex-col justify-center items-center">
                  <Loader size={12} className="animate-spin" />
                </div>
              )}
              {usersList.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-4 mr-2">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={user.imageUrl} alt="Avatar" />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName + " " + user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              ))}
              {usersList.length > 0 && (
                <Link
                  className="text-primary text-sm font-medium text-left hover:underline mr-1"
                  href={"/dashboard/users"}
                >
                  View all users
                </Link>
              )}

              {!usersLoading && usersList.length <= 0 && <p>No Users Found</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
