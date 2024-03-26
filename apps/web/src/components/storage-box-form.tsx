import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createStorageBoxSchema,
  paginatedStorageBlockBoxesResponseSchema,
  paginatedStoragesResponseSchema,
} from "@tetoy/api/schema";
import { productsQuries } from "~/common/keys/products";
import { usersQuries } from "~/common/keys/users";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { DialogClose, DialogFooter } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Virtuoso } from "react-virtuoso";
import { useDebounceValue } from "usehooks-ts";
import { z } from "zod";

export type Box = z.infer<typeof createStorageBoxSchema>;

const boxSchema = paginatedStorageBlockBoxesResponseSchema.shape.data.pick({
  boxes: true,
}).shape.boxes;

type EditBox = z.infer<typeof boxSchema>[number];

interface StorageBoxFormProps {
  box?: EditBox;
  isPending: boolean;
  onSubmit: (values: Box) => void;
}

export function StorageBoxForm({ isPending, onSubmit }: StorageBoxFormProps) {
  const form = useForm<z.infer<typeof createStorageBoxSchema>>({
    resolver: zodResolver(createStorageBoxSchema),
    values: {
      countries: [],
      grade: "",
      subGrade: null,
      price: 0,
      productId: "",
      totalBoxes: 0,
      userId: "",
      weight: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          className="space-y-4"
          disabled={isPending}
          aria-disabled={isPending}
        ></fieldset>
      </form>
    </Form>
  );
}
