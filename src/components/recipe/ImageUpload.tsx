"use client";

import { useState, type ChangeEvent, type DragEvent, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For hidden file input
import { Label } from '@/components/ui/label'; // For associating with hidden input
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploadProps {
  onImageUpload: (file: File, dataUri: string) => void;
  currentImagePreview?: string | null;
  disabled?: boolean;
}

export default function ImageUpload({ onImageUpload, currentImagePreview, disabled = false }: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(currentImagePreview || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, GIF, WebP).');
      setImagePreview(null);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setImagePreview(dataUri);
      onImageUpload(file, dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRemoveImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent triggering file input if inside label
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    // Notify parent that image is removed by passing null
    // This part depends on how you want to handle removal in the parent.
    // For now, we assume onImageUpload with nulls signifies removal.
    // Or add a specific onImageRemove prop.
    // For this component, it just clears its own state.
    // The parent form should handle resetting its 'photoDataUri' field.
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 md:p-6">
        <Label
          htmlFor="image-upload-input"
          className={`cursor-pointer block border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${disabled ? 'bg-muted/50 cursor-not-allowed' : 'border-border hover:border-primary bg-background hover:bg-secondary/20'}
            ${error ? 'border-destructive' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={(e) => { if (e.target === e.currentTarget) triggerFileInput(); }} // Allow clicks on label to open dialog
        >
          <Input
            id="image-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={disabled}
          />
          {imagePreview ? (
            <div className="relative group">
              <Image
                src={imagePreview}
                alt="Uploaded ingredient"
                width={400}
                height={300}
                className="mx-auto max-h-60 w-auto object-contain rounded-md shadow-sm"
                data-ai-hint="food ingredients"
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <XCircle size={20} />
                </Button>
              )}
              <p className="mt-2 text-sm text-muted-foreground">Click or drag to change image.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <UploadCloud size={48} className="text-primary" />
              <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
              <p className="text-sm">PNG, JPG, GIF, WebP (MAX. 5MB)</p>
            </div>
          )}
        </Label>
        {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}
