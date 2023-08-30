"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { distanceSchema, type Distance } from "~/pages/pace";

type AddFormProps = {
  addDistance: (distance: Distance) => void;
};

const presets = {
  "400m": {
    distanceInMeters: 400,
    label: "400m",
    showMs: true,
  },
  "800m": {
    distanceInMeters: 800,
    label: "800m",
    showMs: true,
  },
  mile: {
    distanceInMeters: 1609,
    label: "Mile",
    showMs: false,
  },
  marathon: {
    distanceInMeters: 42195,
    label: "Marathon",
    showMs: false,
  },
  "half-marathon": {
    distanceInMeters: 21097,
    label: "Half marathon",
    showMs: false,
  },
} as const;

type Preset = keyof typeof presets;

export function AddForm({ addDistance }: AddFormProps) {
  const form = useForm<Distance>({
    resolver: zodResolver(distanceSchema),
    defaultValues: {
      id: "",
      distanceInMeters: 1000,
      label: "",
      showMs: false,
    },
  });
  const { isSubmitSuccessful } = form.formState;

  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);

  const onSubmit = (data: Distance) => {
    const id = nanoid();
    addDistance({ ...data, id });
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setCurrentPreset(null);
    }
  }, [form, isSubmitSuccessful]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          title="Add distance"
          size="icon"
          className="mr-5 mt-5 h-12 w-12 rounded-full p-0"
        >
          <Plus className="m-0 h-8 w-8 " />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add distance</DialogTitle>
          <DialogDescription>
            Choose a preset distance, or specify a custom one
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          {Object.entries(presets).map(([preset, distance]) => (
            <Button
              size="sm"
              key={preset}
              variant={currentPreset === preset ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPreset(preset as Preset);
                form.setValue("distanceInMeters", distance.distanceInMeters);
                form.setValue("label", distance.label);
                form.setValue("showMs", distance.showMs);
              }}
            >
              {preset}
            </Button>
          ))}
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="distanceInMeters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Distance <span className="text-xs">(in meters)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        onChange={(e) => {
                          setCurrentPreset(null);
                          const value = e.target.value;
                          const parsed = parseInt(value, 10);
                          if (isNaN(parsed)) {
                            field.onChange(0);
                          }
                          field.onChange(parsed);
                        }}
                        value={
                          isNaN(field.value) || field.value === 0
                            ? ""
                            : field.value.toString()
                        }
                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1k"
                        {...field}
                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showMs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-800 p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show milliseconds</FormLabel>
                      <FormDescription>
                        Show millisecond precision in the pace field.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogClose asChild>
              <Button type="submit">Save</Button>
            </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
