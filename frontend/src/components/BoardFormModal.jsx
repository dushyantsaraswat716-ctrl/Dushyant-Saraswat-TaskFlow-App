import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import Modal from "./Modal";
import { createBoard, renameBoard } from "../redux/slices/boardSlice";
import { editTask } from "../redux/slices/taskSlice";
import useToast from "../hooks/useToast";

export default function BoardFormModal({ open, onClose, board, tasksInBoard = [] }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const isEdit = Boolean(board);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { name: "" } });

  useEffect(() => {
    if (open) reset({ name: board || "" });
  }, [open, board, reset]);

  const onSubmit = async ({ name }) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (isEdit) {
      if (trimmed === board) return onClose();
      setSaving(true);
      try {
       
        await Promise.all(tasksInBoard.map((t) => dispatch(editTask({ id: t._id, data: { category: trimmed } })).unwrap()));
        dispatch(renameBoard({ oldName: board, newName: trimmed }));
        toast.success("Board renamed");
        onClose();
      } catch {
        toast.error("Could not rename all tasks in this board");
      } finally {
        setSaving(false);
      }
    } else {
      dispatch(createBoard(trimmed));
      toast.success("Board created");
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Rename board" : "Create board"} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label-text">Board name</label>
          <input
            className="input-field"
            placeholder="e.g. Marketing"
            {...register("name", { required: "Board name is required" })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create board"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
