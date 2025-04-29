"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function ACL() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("/api/admins", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setAdmins(data);
      setMaxPage(Math.ceil(data.length / limit));
    };
    getData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/admins/search?search=${search}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setAdmins(data);
    setMaxPage(Math.ceil(data.length / limit));
    setPage(1);
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleEdit = (admin) => {
    router.push(`/admin/acl/edit/${admin.id}`);
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-start py-10 px-2">
      <Card className="w-full max-w-4xl shadow-lg border border-border bg-background">
        <CardHeader>
          <CardTitle>Access Control List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Admins"
                className="w-full"
              />
              <Button type="submit" variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
          <div className="overflow-x-auto rounded-md border border-border mb-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.slice((page - 1) * limit, page * limit).map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.id}</TableCell>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEdit(admin)} variant="secondary" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={page}
            maxPage={maxPage}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
