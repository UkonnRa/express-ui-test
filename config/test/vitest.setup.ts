import { config } from "@vue/test-utils";
import JournalViewApiImpl from "../api/JournalViewApiImpl";

config.global.provide["JournalViewApi"] = new JournalViewApiImpl();
