import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  createStorageBoxSchema,
  paginatedStorageBlockBoxesResponseSchema,
} from "@tetoy/api/schema";
import { countriesQuries } from "~/common/keys/countries";
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
import { cn } from "~/lib/utils";
import { CommandLoading } from "cmdk";
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Virtuoso } from "react-virtuoso";
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
      subGrade: "",
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
        >
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
            <div className="w-full sm:w-6/12 sm:px-2">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Grade" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full sm:w-6/12 sm:px-2">
              <FormField
                control={form.control}
                name="subGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub grade</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sub grade" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
            <div className="w-full sm:w-6/12 sm:px-2">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        min="0"
                        type="number"
                        placeholder="Weight"
                        inputMode="decimal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full sm:w-6/12 sm:px-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        min="0"
                        type="number"
                        placeholder="Price"
                        inputMode="decimal"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
            <div className="w-full sm:w-6/12 sm:px-2">
              <FormField
                control={form.control}
                name="countries"
                render={() => (
                  <FormItem>
                    <FormLabel>Countries</FormLabel>
                    <CountriesCombobox />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <DialogFooter className="space-y-4 sm:space-y-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </fieldset>
      </form>
    </Form>
  );
}

function CountriesCombobox() {
  const [open, setOpen] = React.useState(false);
  const [countries] = React.useState(new Map());
  const { data, isLoading } = useQuery(countriesQuries.list());

  const countriesData = data?.data.countries ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {countries.size > 0 ? "selected" : "Select country..."}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search countries..." />

          <CommandList>
            {isLoading && <CommandLoading>Loading...</CommandLoading>}
            <CommandEmpty>No countries</CommandEmpty>
            <CommandGroup>
              <Virtuoso
                style={{ height: "160px" }}
                data={countriesData}
                itemContent={(index) => {
                  return (
                    <CommandItem
                      key={countriesData[index].id}
                      value={countriesData[index].name}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          countries.has(countriesData[index].id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {countriesData[index].name}
                    </CommandItem>
                  );
                }}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
