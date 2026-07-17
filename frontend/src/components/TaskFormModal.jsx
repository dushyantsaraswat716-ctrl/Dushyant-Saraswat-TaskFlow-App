import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { FiLoader } from "react-icons/fi";
import Modal from "./Modal";
import { addTask, editTask } from "../redux/slices/taskSlice";
import { TASK_PRIORITIES, TASK_STATUSES, REMINDER_OPTIONS } from "../constants";
import useToast from "../hooks/useToast";

export default function TaskFormModal({ open, onClose, task }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const mutateStatus = useSelector((s) => s.tasks.mutateStatus);
  const isEdit = Boolean(task);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      status: "To-Do",
      dueDate: "",
      dueTime: "",
      reminder: "none",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
            title: task.title,
            description: task.description,
            category: task.category || "",
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
            dueTime: task.dueTime || "",
            reminder: task.reminder || "none",
          }
          : {
            title: "",
            description: "",
            category: "",
            priority: "medium",
            status: "To-Do",
            dueDate: "",
            dueTime: "",
            reminder: "none",
          }
      );
    }
  }, [open, task, reset]);
  const onSubmit = async (values) => {
    const payload = {
      ...values,
      category: values.category?.trim() || "General",
    };

    const result = await dispatch(
      isEdit
        ? editTask({ id: task._id, data: payload })
        : addTask(payload)
    );

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isEdit ? "Task updated" : "Task created");

      reset();    
      onClose();    
    } else {
      toast.error(result.payload || "Something went wrong");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit task" : "New task"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text">Title</label>
          <input className="input-field" placeholder="Task title" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label-text">Description</label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="What needs to be done?"
            {...register("description")}
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Priority</label>
            <select className="input-field capitalize" {...register("priority")}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Status</label>
            <select className="input-field" {...register("status")}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Board / category</label>
            <input className="input-field" placeholder="General" {...register("category")} />
          </div>
          <div>
            <label className="label-text">Due date</label>
            <input type="date" className="input-field" {...register("dueDate")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Due time</label>
            <input type="time" className="input-field" {...register("dueTime")} />
          </div>
          <div>
            <label className="label-text">Reminder</label>
            <select className="input-field" {...register("reminder")}>
              {REMINDER_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={mutateStatus === "loading"} className="btn-primary">
            {mutateStatus === "loading" && <FiLoader className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>

    </Modal>
  );
}
