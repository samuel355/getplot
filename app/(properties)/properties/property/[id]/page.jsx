"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Bed,
  Bath,
  Home,
  MapPin,
  ArrowLeft,
  Edit,
  Calendar,
  Ruler,
  Tag,
  CheckCircle,
  Clock,
  AlertTriangle,
  CircleDollarSign,
  Share2,
  Trash2,
  FileText
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter , 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import PropertyMap from '../../components/property-map';
import { useRouter } from 'next/navigation';
import PropertyTabs from './components/PropertyTabs';

export default function PropertyDetailPage({ params }) {
  const { id } = params;
  const { user, isSignedIn } = useUser();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (!isSignedIn) return;
    
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties') 
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          toast.error('Property not found');
          router.back();
          return;
        }
        
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
        router.push('/properties/list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [isSignedIn, user, id]);
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
      
      if (error) throw error;
      
      toast.success('Property deleted successfully');
      // Navigate to property list
      window.location.href = '/properties/list';
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setDeleteConfirmOpen(false);
    }
  };
  
  if (!isSignedIn) {
    return <div>Please sign in to view this page</div>;
  }
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-muted rounded-md animate-pulse"></div>
        <div className="h-8 w-64 bg-muted rounded-md animate-pulse"></div>
        <div className="h-4 w-32 bg-muted rounded-md animate-pulse"></div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Property not found</h3>
        <p className="text-muted-foreground mt-1">
          The property you are looking for does not exist or you don't have permission to view it.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/properties/list">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </Button>
      </div>
    );
  }
  
  const images = property.images || [];
  const features = property.features || [];
  
  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/properties/list">
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <StatusBadge status={property.status} />
            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs capitalize">
              {property.type}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{property.title}</h1>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <span>
              {property.location} - {property.address}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link href={`/properties/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Property
            </Link>
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-lg">
            {images.length > 0 ? (
              <img 
                src={images[selectedImage]?.url || "/placeholder-property.jpg"} 
                alt={property.title} 
                className="w-full h-[400px] object-cover"
              />
            ) : (
              <div className="w-full h-[400px] bg-muted flex items-center justify-center">
                <Home className="h-16 w-16 text-muted-foreground opacity-20" />
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img 
                    src={image.url} 
                    alt={`${property.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          <PropertyTabs property={property} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Property Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h3>
                  <StatusDetail status={property.status} />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {property.listing_type === 'rent' ? 'Monthly Rent' : 
                     property.listing_type === 'airbnb' ? 'Price per Day' : 'Price'}
                  </h3>
                  <p className="text-2xl font-bold">
                    ₵{Number(property.listing_type === 'sale' ? property.price : property.rental_price).toLocaleString()}
                  </p>
                  {property.listing_type === 'sale' && property.negotiable && (
                    <p className="text-sm text-muted-foreground">Price is negotiable</p>
                  )}
                  {property.listing_type === 'rent' && property.rental_duration && (
                    <p className="text-sm text-muted-foreground">Duration: {property.rental_duration.replace('_', ' ')}</p>
                  )}
                </div>
                
                <div className="pt-2">
                  <Button className="w-full">
                    {property.status === 'approved'
                      ? 'Mark as Sold'
                      : property.status === 'rejected'
                      ? 'Edit & Resubmit'
                      : property.status === 'pending'
                      ? 'Awaiting Review'
                      : 'Contact Agent'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{property.type}</span>
                </div>
                {property.type === 'house' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bedrooms</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bathrooms</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{property.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created On</span>
                  <span className="font-medium">
                    {property.created_at ? format(new Date(property.created_at), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/properties/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <CircleDollarSign className="mr-2 h-4 w-4" />
                  Update Price
                </Button>
                
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href={`/properties/list`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Properties
                  </Link>
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Property
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{property.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusStyles = {
    approved: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    sold: "bg-blue-100 text-blue-800 border-blue-200",
  };
  
  const style = statusStyles[status] || statusStyles.pending;
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatusDetail({ status }) {
  const statusInfo = {
    approved: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: "Approved",
      description: "Your property is live and visible to potential buyers."
    },
    pending: {
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      title: "Pending Review",
      description: "Your property is being reviewed. This usually takes 1-2 business days."
    },
    rejected: {
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      title: "Rejected",
      description: "Your property was rejected. Please review admin feedback and resubmit."
    },
    sold: {
      icon: <Home className="h-5 w-5 text-blue-500" />,
      title: "Sold",
      description: "This property has been marked as sold."
    }
  };  
  
  const info = statusInfo[status] || statusInfo.pending;
  
  return (
    <div className="flex items-start gap-3">
      <div>{info.icon}</div>
      <div>
        <h4 className="font-medium">{info.title}</h4>
        <p className="text-sm text-muted-foreground">{info.description}</p>
      </div>
    </div>
  );
}