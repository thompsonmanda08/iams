/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudArrowUpIcon,
  FileUp as DocumentArrowUpIcon,
  X as XMarkIcon
} from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { twMerge } from "tailwind-merge";

import { MAX_FILE_SIZE, staggerContainerItemVariants } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Loader from "./loader";
import { Progress } from "./progress";

const variants = {
  base: cn(
    "relative rounded-md flex justify-center items-center flex-col cursor-pointer min-h-[150px] min-w-[200px] border border-dashed border-gray-400 dark:border-gray-300 transition-colors duration-200 ease-in-out"
  ),
  image: "border-0 p-0 min-h-0 min-w-0 relative  dark:bg-foreground-900 rounded-md",
  active: "border-2",
  disabled:
    "bg-gray-200 border-gray-300 cursor-default pointer-events-none bg-opacity-30 dark:bg-gray-700",
  accept: "border border-blue-500 bg-blue-500 bg-opacity-10",
  reject: "border border-red-700 bg-red-700 bg-opacity-10"
};

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: any) {
    return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
  },
  fileInvalidType() {
    return "Invalid file type.";
  },
  tooManyFiles(maxFiles: any) {
    return `You can only add ${maxFiles} file(s).`;
  },
  fileNotSupported() {
    return "The file is not supported.";
  }
};

export default function UploadField(
  {
    label,
    isLoading,
    required,
    handleFile,
    acceptedFiles,
    options,
    ...props
  }: {
    label?: string;
    isLoading?: boolean;
    required?: boolean;
    handleFile: (file: File) => void;
    acceptedFiles?: Record<string, string[] | string>;
    options?: any;
    props?: any;
  },
  ref?: any
) {
  return (
    <motion.div key={"step-2-1"} className="w-full" variants={staggerContainerItemVariants}>
      <label className="text-foreground/80 mb-2 text-xs font-medium capitalize">
        {label} {required && <span className="font-bold text-red-500"> *</span>}
      </label>
      <SingleFileDropzone
        ref={ref}
        isLandscape
        className={"min-h-8 px-2"}
        disabled={isLoading}
        isLoading={isLoading}
        dropzoneOptions={{
          maxSize: MAX_FILE_SIZE,
          maxFiles: 1, // Only 1 file allowed
          accept: acceptedFiles,
          ...options
        }}
        onChange={(file) => handleFile(file as File)}
        {...props}
      />
    </motion.div>
  );
}

export const SingleFileDropzone = React.forwardRef<any, DropZoneProps>(
  (
    {
      dropzoneOptions = {
        maxSize: MAX_FILE_SIZE,
        maxFiles: 1 // Only 1 file allowed
      },
      width,
      height,
      value,
      className,
      disabled,
      onChange,
      file,
      isMultipleFiles = false,
      isLandscape,
      isLoading = false,
      showPreview = false,
      isUploaded = false,
      preview = "",
      uploadProgress: externalProgress
    },
    ref
  ) => {
    const [imagePreview, setImagePreview] = React.useState(preview);
    const [validationError, setValidationError] = React.useState<string | undefined>();
    const [validatedFile, setValidatedFile] = React.useState<File | null>(null);
    const [simulatedProgress, setSimulatedProgress] = React.useState(0);

    // Simulate upload progress when isLoading and no external progress is provided
    React.useEffect(() => {
      if (!isLoading) {
        setSimulatedProgress(0);
        return;
      }

      // Start at 0 and ramp up quickly at first, then slow down
      setSimulatedProgress(5);
      const intervals = [
        setTimeout(() => setSimulatedProgress(15), 200),
        setTimeout(() => setSimulatedProgress(30), 500),
        setTimeout(() => setSimulatedProgress(50), 1000),
        setTimeout(() => setSimulatedProgress(65), 1800),
        setTimeout(() => setSimulatedProgress(78), 3000),
        setTimeout(() => setSimulatedProgress(88), 5000),
        setTimeout(() => setSimulatedProgress(93), 8000),
      ];

      return () => intervals.forEach(clearTimeout);
    }, [isLoading]);

    const uploadProgress = externalProgress ?? simulatedProgress;

    const imageUrl = React.useMemo(() => {
      if (typeof value === "string") {
        // in case a url is passed in, use it to display the image
        return value;
      } else if (value) {
        // in case a file is passed in, create a base64 url to display the image
        return URL.createObjectURL(value);
      }

      return null;
    }, [value]);

    // dropzone configuration
    const {
      getRootProps,
      getInputProps,
      acceptedFiles,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject
    } = useDropzone({
      multiple: isMultipleFiles,
      disabled,
      onDrop: async (acceptedFiles) => {
        // OF THE MULTIPLE FILE ADD GET ONLY ONE
        const file = acceptedFiles[0] as File;

        if (file) {
          // Enhanced security validation
          try {
            setValidationError(undefined);
            setValidatedFile(null);

            // Check for executable file extensions
            const dangerousExtensions = [
              "exe",
              "bat",
              "cmd",
              "com",
              "pif",
              "scr",
              "vbs",
              "js",
              "jar",
              "sh",
              "ps1",
              "msi",
              "dll",
              "app",
              "deb",
              "rpm",
              "dmg"
            ];

            const extension = file.name.split(".").pop()?.toLowerCase();
            if (extension && dangerousExtensions.includes(extension)) {
              setValidationError("Executable files are not allowed.");
              return;
            }

            // Validate file type matches extension
            const allowedMimeTypes: Record<string, string[]> = {
              "application/pdf": ["pdf"],
              "image/jpeg": ["jpg", "jpeg"],
              "image/png": ["png"],
              "image/webp": ["webp"],
              "image/gif": ["gif"],
              "image/svg+xml": ["svg"],
              "image/avif": ["avif"],
              "application/vnd.ms-excel": ["xls"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
              "text/csv": ["csv"]
            };

            const validExtensions = allowedMimeTypes[file.type];
            if (!validExtensions || !extension || !validExtensions.includes(extension)) {
              setValidationError("File type and extension do not match.");
              return;
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
              setValidationError(`The file is too large. Max size is ${formatFileSize(MAX_FILE_SIZE)}.`);
              return;
            }

            // Basic file content validation (check first few bytes)
            const firstBytes = await readFileBytes(file, 12);
            if (!isValidFileSignature(firstBytes, file.type)) {
              setValidationError("Invalid file type. The file content does not match its extension.");
              return;
            }

            const fileObject = Object.assign(file, {
              preview: URL.createObjectURL(file)
            });

            const imagePreview = fileObject?.preview;

            setValidatedFile(file);
            void onChange?.(file, imagePreview);
          } catch (error) {
            setValidationError("File validation failed. Please try another file.");
          }
        }
      },
      ...dropzoneOptions,
      maxSize: MAX_FILE_SIZE, // 5MB - files larger than this will be rejected
      accept: dropzoneOptions?.accept || { "application/pdf": [".pdf"] }
    });

    React.useImperativeHandle(ref, () => ({
      clear() {
        setImagePreview("");
        setValidationError(undefined);
        setValidatedFile(null);
        onChange?.(undefined, undefined);
      }
    }));

    // styling
    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          imageUrl && variants.image,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className
        ).trim(),
      [isFocused, imageUrl, fileRejections, isDragAccept, isDragReject, disabled, className]
    );

    // error validation messages
    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0];

        if (errors[0]?.code === "file-too-large") {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
        } else if (errors[0]?.code === "file-invalid-type") {
          return ERROR_MESSAGES.fileInvalidType();
        } else if (errors[0]?.code === "too-many-files") {
          return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
        } else {
          return ERROR_MESSAGES.fileNotSupported();
        }
      }

      return undefined;
    }, [fileRejections, dropzoneOptions]);

    React.useEffect(() => {
      if (validatedFile) {
        setImagePreview(URL.createObjectURL(validatedFile));
      } else if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(preview);
      }
    }, [value, validatedFile, file, preview]);

    return (
      <div>
        <div
          {...getRootProps({
            className: dropZoneClassName,
            style: {
              width,
              height
            }
          })}>
          {/* Main File Input */}
          <input ref={ref} {...getInputProps()} />

          {isLoading ? (
            <div className="flex w-full flex-col items-center gap-3 px-6 py-4">
              <CloudArrowUpIcon className="h-8 w-8 animate-pulse text-gray-400" />
              <div className="w-full max-w-xs space-y-1.5">
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Uploading...</span>
                  <span className="font-medium">{Math.round(uploadProgress)}%</span>
                </div>
              </div>
            </div>
          ) : showPreview && (imagePreview || validatedFile || file) ? (
            <div className="aspect-video max-h-40 w-80">
              <img
                alt={acceptedFiles[0]?.name || file?.name}
                className="h-full w-full rounded-md object-contain"
                src={imagePreview || imageUrl || ""}
              />
            </div>
          ) : (isUploaded && file) || validatedFile ? (
            // ********************* FILE UPLOAD PREVIEW ******************* //
            <div
              className={cn("relative flex flex-col items-center py-2", {
                "w-full flex-row items-center justify-between": isLandscape
              })}>
              <DocumentArrowUpIcon
                className={cn("absolute h-24 w-24 text-gray-200", {
                  "m-0 h-8 w-8": isLandscape
                })}
              />
              <div
                className={cn("relative z-10 flex flex-col items-center gap-4", {
                  "bg-red-10 w-full gap-0": isLandscape
                })}>
                {!isLandscape && (
                  // ONLY SHOWS ON THE UPRIGHT COMPONENT
                  <p className="flex items-center gap-2 font-bold uppercase">
                    <CheckCircleIcon className="h-7 w-7 font-bold text-green-500" />
                    Your file is ready
                  </p>
                )}
                <span className="text-primary flex w-full max-w-sm items-center gap-2 truncate text-xs font-semibold lg:text-sm">
                  {isLandscape && <CheckCircleIcon className="h-6 w-6 text-green-500" />}{" "}
                  {validatedFile?.name || file?.name}
                </span>
                {/* // ONLY SHOWS ON THE UPRIGHT COMPONENT */}
                {/* {!isLandscape && (
                  <Button isDisabled className={'opacity-100'}>
                    Change
                  </Button>
                )} */}
                {isLandscape && (
                  <XMarkIcon className="absolute right-0 aspect-square w-5 rounded-md bg-red-100 p-0.5 text-red-500 hover:text-red-500" />
                )}
              </div>
            </div>
          ) : (
            // ********************* FILE UPLOAD ICON ******************* //
            <div
              className={cn("flex flex-col items-center justify-center text-xs text-gray-400", {
                "w-full flex-row items-center justify-between": isLandscape
              })}>
              <div
                className={cn("flex flex-col items-center", {
                  "flex-row gap-2 font-medium": isLandscape
                })}>
                <CloudArrowUpIcon className={cn("mb-2 h-12 w-12", { "m-0 w-8": isLandscape })} />
                <div className="text-center text-gray-400">
                  <span>Drag & Drop or <span className="text-primary font-medium underline">browse</span></span>
                  <p className="mt-1 text-[11px] text-gray-400/80">
                    {formatFileSize(MAX_FILE_SIZE)} max
                  </p>
                </div>
              </div>
              {/* {!isLandscape && (
                // ONLY SHOWS ON THE UPRIGHT COMPONENT
                <div className={cn('mt-3', { 'm-0': isLandscape })}>
                  <Button isDisabled className={'opacity-100'}>
                    Upload
                  </Button>
                </div>
              )} */}
            </div>
          )}

          {/* Remove Image Icon */}
          {imageUrl && !disabled && (
            <div
              className="group absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 transform"
              onClick={(e) => {
                setValidatedFile(null);
                setImagePreview("");
                setValidationError(undefined);
                void onChange?.(undefined);
                e.stopPropagation();
              }}>
              <div className="flex h-5 w-5 items-center justify-center rounded-md border border-solid border-red-100 bg-red-50 transition-all duration-300 hover:h-6 hover:w-6 dark:border-red-100 dark:bg-red-50/50">
                <XMarkIcon className="text-red-500" height={16} width={16} />
              </div>
            </div>
          )}
        </div>
        {/* Error Text */}
        {(errorMessage || validationError) && (
          <motion.span
            className={cn("mt-1 ml-1 text-sm text-red-500")}
            whileInView={{
              scale: [0, 1],
              opacity: [0, 1],
              transition: { duration: 0.3 }
            }}>
            {errorMessage || validationError}
          </motion.span>
        )}
      </div>
    );
  }
);

type DropZoneProps = {
  dropzoneOptions?: {
    maxSize?: number;
    maxFiles?: number;
    accept?: Record<string, string[]>;
    onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    onDragOver?: () => void;
    onDragEnd?: () => void;
    onDropAccepted?: () => void;
    onDropRejected?: () => void;
    [key: string]: any;
  };
  width?: any;
  height?: any;
  value?: any;
  className?: any;
  disabled?: boolean;
  onChange?: (file?: File, imagePreview?: string) => void;
  file?: any;
  acceptableFileTypes?: Record<string, string[] | string>;
  isMultipleFiles?: boolean;
  isLandscape?: boolean;
  isLoading?: boolean;
  showPreview?: boolean;
  isUploaded?: boolean;
  preview?: string;
  uploadProgress?: number;
};

SingleFileDropzone.displayName = "SingleFileDropzone";

function formatFileSize(bytes: any) {
  if (!bytes) {
    return "0 Bytes";
  }
  bytes = Number(bytes);
  if (bytes === 0) {
    return "0 Bytes";
  }
  const k = 1024;
  const dm = 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}

// Helper function to read file bytes
async function readFileBytes(file: File, numBytes: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(arrayBuffer.slice(0, numBytes)));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, numBytes));
  });
}

// Helper function to validate file signatures (magic numbers)
function isValidFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  switch (mimeType) {
    case "application/pdf":
      return hex.startsWith("25504446"); // %PDF
    case "image/jpeg":
      return hex.startsWith("ffd8ff"); // JPEG
    case "image/png":
      return hex.startsWith("89504e47"); // PNG
    case "image/webp":
      return hex.startsWith("52494646") && hex.length >= 24 && hex.slice(16, 24) === "57454250"; // RIFF....WEBP
    case "image/gif":
      return hex.startsWith("474946383961") || hex.startsWith("474946383761"); // GIF89a or GIF87a
    case "image/svg+xml":
      return true; // SVG is XML text, no specific magic number
    case "image/avif":
      return hex.slice(8, 16) === "66747970"; // ....ftyp (AVIF is ISOBMFF-based)
    case "application/vnd.ms-excel":
      return hex.startsWith("d0cf11e0") || hex.startsWith("09082100") || hex.startsWith("fdffffff"); // Excel .xls
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return hex.startsWith("504b0304") || hex.startsWith("504b0506") || hex.startsWith("504b0708"); // Excel .xlsx (ZIP-based)
    case "text/csv":
      return true; // CSV files are plain text, no specific magic number
    default:
      return true; // Allow unknown types to pass through
  }
}

export const ACCEPTABLE_FILE_TYPES = {
  pdf: {
    "application/pdf": [".pdf"]
  },
  images: {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
    "image/svg+xml": [".svg"],
    "image/avif": [".avif"]
  },
  png: {
    "image/png": [".png"]
  },

  word: {
    "application/msword": [".doc", ".docx"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
  },

  excel: {
    "text/csv": [".csv"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
  },

  powerpoint: {
    "application/vnd.ms-powerpoint": [".ppt", ".pptx"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"]
  }
};
